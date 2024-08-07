import { Kysely } from "kysely";
import { bootstrapCore } from "../core";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { getWikidataSoftware } from "../core/adapters/wikidata/getWikidataSoftware";
import { getWikidataSoftwareOptions } from "../core/adapters/wikidata/getWikidataSoftwareOptions";
import { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { testPgUrl } from "../tools/test.helpers";
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
    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(testPgUrl) });

    const { core, context, dbApi } = await bootstrapCore({
        "dbConfig": { dbKind: "kysely", kyselyDb },
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
        dbApi,
        coreContext: context,
        keycloakParams: undefined,
        redirectUrl: undefined,
        externalSoftwareDataOrigin,
        readmeUrl: "http://readme.url",
        termsOfServiceUrl: "http://terms.url",
        jwtClaimByUserKey,
        getSoftwareExternalDataOptions: getWikidataSoftwareOptions,
        getSoftwareExternalData: getWikidataSoftware
    });

    return { apiCaller: router.createCaller({ user }), kyselyDb };
};
