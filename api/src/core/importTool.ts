// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin } from "./ports/GetSoftwareExternalData";
import { importFromHALSource, importFromWikidataSource } from "./usecases/importFromSource";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfImportTool = {
    dbConfig: DbConfig;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    botAgentEmail: string | undefined;
    listToImport?: string[];
};

const getDbApiAndInitializeCache = (dbConfig: DbConfig): { dbApi: DbApiV2 } => {
    if (dbConfig.dbKind === "kysely") {
        return {
            dbApi: createKyselyPgDbApi(dbConfig.kyselyDb)
        };
    }

    const shouldNotBeReached: never = dbConfig.dbKind;
    throw new Error(`Unsupported case: ${shouldNotBeReached}`);
};

export async function importTool(params: ParamsOfImportTool): Promise<boolean> {
    const { dbConfig, externalSoftwareDataOrigin, botAgentEmail, listToImport } = params;

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    if (!botAgentEmail) throw new Error("No bot agent email provided");
    if (externalSoftwareDataOrigin === "HAL") {
        console.info(" ------ Feeding database with HAL software started ------");
        const importHAL = importFromHALSource(dbApi);
        return importHAL(botAgentEmail).then(promises =>
            Promise.all(promises).then(() => {
                console.info(" ------ Feeding database with HAL software finished ------");
                return true;
            })
        );
    } else if (externalSoftwareDataOrigin === "wikidata") {
        console.info(" ------ Feeding database with Wikidata software started ------");
        const importWikidata = importFromWikidataSource(dbApi);
        return importWikidata(botAgentEmail, listToImport ?? []).then(promises =>
            Promise.all(promises).then(() => {
                console.info(" ------ Feeding database with Wikidata software finished ------");
                return true;
            })
        );
    } else {
        return Promise.reject(`${externalSoftwareDataOrigin} not supported`);
    }
}
