import { createKeycloakAdminApiClient } from "../../tools/keycloakAdminApiClient";
import * as runExclusive from "run-exclusive";
import memoize from "memoizee";
import { UserApi } from "../ports/UserApi";

export type KeycloakUserApiParams = {
    url: string;
    adminPassword: string;
    realm: string;
    organizationUserProfileAttributeName: string;
};

const maxAge = 5 * 60 * 1000;

export function createKeycloakUserApi(params: KeycloakUserApiParams): {
    userApi: UserApi;
    initializeUserApiCache: () => Promise<void>;
} {
    const { url, adminPassword, realm, organizationUserProfileAttributeName } = params;

    const keycloakAdminApiClient = createKeycloakAdminApiClient({
        url,
        adminPassword,
        realm
    });

    const groupRef = runExclusive.createGroupRef();

    const userApi: UserApi = {
        "updateUserEmail": runExclusive.build(groupRef, ({ userId, email }) =>
            keycloakAdminApiClient.updateUser({
                userId,
                "body": { email }
            })
        ),
        "updateUserOrganization": runExclusive.build(groupRef, ({ userId, organization }) =>
            keycloakAdminApiClient.updateUser({
                userId,
                "body": { "attributes": { [organizationUserProfileAttributeName]: organization } }
            })
        ),
        "getAllowedEmailRegexp": memoize(
            async () => {
                const attributes = await keycloakAdminApiClient.getUserProfileAttributes();

                let emailRegExpStr: string;

                try {
                    emailRegExpStr = (attributes.find(({ name }) => name === "email") as any).validations.pattern
                        .pattern;
                } catch {
                    throw new Error(`Can't extract RegExp from ${JSON.stringify(attributes)}`);
                }

                return emailRegExpStr;
            },
            {
                "promise": true,
                maxAge,
                "preFetch": true
            }
        ),
        "getAllOrganizations": memoize(
            async () => {
                const organizations = new Set<string>();

                let first = 0;

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const max = 100;

                    const users = await keycloakAdminApiClient.getUsers({
                        first,
                        max
                    });

                    users.forEach(user => {
                        let organization: string;

                        try {
                            organization = user.attributes[organizationUserProfileAttributeName][0];
                        } catch {
                            console.log("Strange user: ", user);

                            return;
                        }

                        //NOTE: Hack, we had a bug so some organization are under
                        //"MESRI: Ministry of Higher Education, Research and Innovation" instead of "MESRI"
                        //(for example)
                        organization = organization.split(":")[0];

                        organizations.add(organization);
                    });

                    if (users.length < max) {
                        break;
                    }

                    first += max;
                }

                return Array.from(organizations);
            },
            {
                "promise": true,
                maxAge,
                "preFetch": true
            }
        ),
        "getUserCount": memoize(
            async () => {
                let count = 0;

                let first = 0;

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const max = 100;

                    const users = await keycloakAdminApiClient.getUsers({
                        first,
                        max
                    });

                    count += users.length;

                    if (users.length < max) {
                        break;
                    }

                    first += max;
                }

                return count;
            },
            {
                "promise": true,
                maxAge,
                "preFetch": true
            }
        )
    };

    const initializeUserApiCache = async () => {
        const start = Date.now();

        console.log("Starting userApi cache initialization...");

        await Promise.all(
            (["getUserCount", "getAllOrganizations", "getAllowedEmailRegexp"] as const).map(async function callee(
                methodName
            ) {
                const f = userApi[methodName];

                await f();

                setInterval(f, maxAge - 10_000);
            })
        );

        console.log(`userApi cache initialization done in ${Date.now() - start}ms`);
    };

    return { userApi, initializeUserApiCache };
}
