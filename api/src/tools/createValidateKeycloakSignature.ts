import urlJoin from "url-join";
import fetch from "node-fetch";
import memoize from "memoizee";
import createKeycloakBacked from "keycloak-backend";
import { assert } from "tsafe/assert";

export type KeycloakParams = {
    url: string;
    realm: string;
    clientId: string;
};

export function createValidateKeycloakSignature(params: KeycloakParams) {
    const { url, realm, clientId } = params;

    const getKeycloakBackendVerifyOffline = memoize(
        async () => {
            const cert = await fetchKeycloakRealmPublicCert({ url, realm });

            const keycloakBackend = createKeycloakBacked({
                realm,
                "auth-server-url": url.replace("/auth", ""),
                "client_id": clientId
            });

            async function keycloakBackendVerifyOffline(params: { keycloakOidcAccessToken: string }): Promise<void> {
                const { keycloakOidcAccessToken } = params;
                const o = await keycloakBackend.jwt.verifyOffline(keycloakOidcAccessToken, cert);

                assert(!o.isExpired(), "Token is expired");
            }

            return { keycloakBackendVerifyOffline };
        },
        { "promise": true }
    );

    async function validateKeycloakSignature(params: { accessToken: string }) {
        const { accessToken } = params;

        const { keycloakBackendVerifyOffline } = await getKeycloakBackendVerifyOffline();

        await keycloakBackendVerifyOffline({
            "keycloakOidcAccessToken": accessToken
        });
    }

    return { validateKeycloakSignature };
}

async function fetchKeycloakRealmPublicCert(params: { url: string; realm: string }) {
    const { url, realm } = params;

    const obj = await fetch(urlJoin(url, "realms", realm, "protocol/openid-connect/certs")).then(res => res.json());

    return [
        "-----BEGIN CERTIFICATE-----",
        obj["keys"].find(({ use }: any) => use === "sig")["x5c"][0],
        "-----END CERTIFICATE-----"
    ].join("\n");
}
