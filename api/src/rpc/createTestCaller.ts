import { Kysely } from "kysely";
import { bootstrapCore } from "../core";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { testPgUrl } from "../tools/test.helpers";
import { createRouter } from "./router";
import { User } from "./user";

type TestCallerConfig = {
    user: User | undefined;
};

export const defaultUser: User = {
    id: "1",
    email: "default.user@mail.com"
};

export type ApiCaller = Awaited<ReturnType<typeof createTestCaller>>["apiCaller"];

export const createTestCaller = async ({ user }: TestCallerConfig = { user: defaultUser }) => {
    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(testPgUrl) });

    const { dbApi, useCases, uiConfig } = await bootstrapCore({
        "dbConfig": { dbKind: "kysely", kyselyDb },
        "githubPersonalAccessTokenForApiRateLimit": "fake-token"
    });

    const { router } = createRouter({
        useCases,
        dbApi,
        oidcParams: { issuerUri: "http://fake.url", clientId: "fake-client-id" },
        redirectUrl: undefined,
        termsOfServiceUrl: "http://terms.url",
        uiConfig
    });

    return { apiCaller: router.createCaller({ user }), kyselyDb };
};
