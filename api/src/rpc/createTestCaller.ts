import { bootstrapCore } from "../core";
import { InMemoryDbApi } from "../core/adapters/dbApi/InMemoryDbApi";
import { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { createRouter } from "./router";
import { User } from "./user";

type TestCallerConfig = {
    user: User | undefined;
};

export const defaultUser: User = {
    id: "1",
    email: "default.user@mail.com",
    organization: "Default Organization"
};

export type ApiCaller = Awaited<ReturnType<typeof createTestCaller>>["apiCaller"];

export const createTestCaller = async ({ user }: TestCallerConfig = { user: defaultUser }) => {
    const externalSoftwareDataOrigin: ExternalDataOrigin = "wikidata";

    const { core, context } = await bootstrapCore({
        "dbConfig": { dbKind: "inMemory" },
        "keycloakUserApiParams": undefined,
        "githubPersonalAccessTokenForApiRateLimit": "fake-token",
        "doPerPerformPeriodicalCompilation": false,
        "doPerformCacheInitialization": false,
        "externalSoftwareDataOrigin": externalSoftwareDataOrigin
    });

    const jwtClaimByUserKey = {
        "id": "sub",
        "email": "email",
        "organization": "organization"
    };

    const { router } = createRouter({
        core,
        coreContext: context,
        keycloakParams: undefined,
        redirectUrl: undefined,
        externalSoftwareDataOrigin,
        readmeUrl: "http://readme.url",
        termsOfServiceUrl: "http://terms.url",
        jwtClaimByUserKey
    });

    return { apiCaller: router.createCaller({ user }), inMemoryDb: context.dbApi as InMemoryDbApi };
};
