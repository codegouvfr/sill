import urlJoin from "url-join";
import fetch from "node-fetch";
import deepMerge from "deepmerge";
import type { KcContext } from "keycloakify/login/kcContext";

export type User = {
    id: string;
    email: string;
    createdTimestamp: number;
    attributes: Record<string, string[]>;
    emailVerified: boolean;
};

export type KeycloakAdminApiClient = {
    updateUser: (params: { userId: string; body: Record<string, unknown> }) => Promise<void>;
    /** NOTE: The return type isn't correct but it would be if Keycloak was consistent */
    getUserProfileAttributes: () => Promise<KcContext.RegisterUserProfile["profile"]["attributes"]>;
    getUsers: (params: { first: number; max: number }) => Promise<User[]>;
};

export function createKeycloakAdminApiClient(params: {
    url: string;
    adminPassword: string;
    realm: string;
}): KeycloakAdminApiClient {
    const { url, adminPassword, realm } = params;

    return {
        "updateUser": async (params: { userId: string; body: Record<string, unknown> }) => {
            const { userId, body } = params;

            const token = await obtainKeycloakAdminAccessToken({
                url,
                adminPassword
            });

            const endpointUrl = urlJoin(url, `admin/realms/${realm}/users/${userId}`);

            const currentBody = await fetch(endpointUrl, {
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${token}`
                }
            }).then(async resp => {
                if (`${resp.status}`[0] !== "2") {
                    throw new Error(await resp.text());
                }

                return resp.json();
            });

            await fetch(endpointUrl, {
                "method": "PUT",
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "body": JSON.stringify(deepMerge(currentBody, body))
            }).then(async resp => {
                const out = await resp.text();

                if (`${resp.status}`[0] !== "2") {
                    throw new Error(out);
                }

                return out;
            });
        },
        "getUserProfileAttributes": async () => {
            const { attributes } = await fetch(urlJoin(url, `admin/realms/${realm}/users/profile`), {
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${await obtainKeycloakAdminAccessToken({ url, adminPassword })}`
                }
            }).then(async resp => {
                if (`${resp.status}`[0] !== "2") {
                    throw new Error(await resp.text());
                }

                return resp.json();
            });

            return attributes;
        },
        "getUsers": async ({ first, max }) =>
            fetch(
                urlJoin(
                    url,
                    `admin/realms/${realm}/users?${Object.entries({
                        first,
                        max
                    })
                        .map(([key, value]) => `${key}=${value}`)
                        .join("&")}`
                ),
                {
                    "method": "GET",
                    "headers": {
                        "Authorization": `Bearer ${await obtainKeycloakAdminAccessToken({ url, adminPassword })}`
                    }
                }
            ).then(async resp => {
                if (`${resp.status}`[0] !== "2") {
                    throw new Error(await resp.text());
                }

                return resp.json();
            })
    };
}

async function obtainKeycloakAdminAccessToken(params: { url: string; adminPassword: string }): Promise<string> {
    const { url, adminPassword } = params;

    const { access_token } = await fetch(urlJoin(url, "realms/master/protocol/openid-connect/token"), {
        "method": "POST",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": Object.entries({
            "client_id": "admin-cli",
            "username": "admin",
            "password": adminPassword,
            "grant_type": "password"
        })
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
    }).then(async resp => {
        if (`${resp.status}`[0] !== "2") {
            throw new Error(await resp.text());
        }

        return resp.json();
    });

    return access_token;
}
