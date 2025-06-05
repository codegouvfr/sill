import { Identifier } from "../../lib/ApiTypes";
import { mergeDepuplicateIdentifierArray } from "../../tools/identifiersTools";
import { DbApiV2 } from "../ports/DbApiV2";

type ParamsOfUAutoImportFromIdentifersUseCase = {
    dbApi: DbApiV2;
};

type SaveIds = { sourceSlug: string; externalId: string; softwareId: number };

export type SelfImportFromIdentifers = () => Promise<boolean>;

const useCaseLogTitle = "[UC.refreshExternalData]";
const useCaseLogTimer = `${useCaseLogTitle} Finsihed fetching external data`;

export const makeSelfImportFromIdentifiers = (
    deps: ParamsOfUAutoImportFromIdentifersUseCase
): SelfImportFromIdentifers => {
    const { dbApi } = deps;

    return async () => {
        console.time(useCaseLogTimer);

        // get the list identiers of per software
        const externalDataList = await dbApi.softwareExternalData.getAll();

        if (!externalDataList) return true;

        const index = externalDataList.reduce(
            (acc, item) => {
                const newAcc = acc;
                if (!item.softwareId || !item.identifiers) return newAcc;
                if (!acc[item.softwareId]) {
                    newAcc[item.softwareId] = item.identifiers;
                    return newAcc;
                }

                const merged = mergeDepuplicateIdentifierArray(acc[item.softwareId], item.identifiers);
                newAcc[item.softwareId] = merged;

                return newAcc;
            },
            {} as Record<number, Identifier[]>
        );

        // get the list of source
        const sources = await dbApi.source.getAll();
        const sourceUrls = sources.reduce(
            (acc, source) => {
                const newAcc = acc;
                newAcc[source.url] = source.slug;
                return newAcc;
            },
            {} as Record<string, string>
        );

        // match
        const resolveRegisterable = async (
            identifier: Identifier,
            softwareId: number
        ): Promise<SaveIds | undefined> => {
            if (!identifier.subjectOf) return undefined;

            // Find corresponding source
            const sourceSlug = sourceUrls[identifier.subjectOf.url.toString()];

            if (!sourceSlug) return undefined;

            const registered = await dbApi.softwareExternalData.get({ externalId: identifier.value, sourceSlug });

            // If registered -> False
            if (registered) return undefined;

            // Otherwise TRUE
            return {
                sourceSlug: sourceSlug,
                externalId: identifier.value,
                softwareId: softwareId
            };
        };

        const instertions = await Promise.all(
            Object.keys(index).map(async softwareId => {
                // Is the source, registered ?
                const toInsert: { sourceSlug: string; externalId: string; softwareId: number }[] = [];

                for (const identifier of index[Number(softwareId)]) {
                    const isRegisterable = await resolveRegisterable(identifier, Number(softwareId));

                    if (isRegisterable) {
                        toInsert.push(isRegisterable);
                    }
                }

                return toInsert;
            })
        );

        const insertFlatten = instertions.flat();
        if (insertFlatten.length === 0) return true;

        await dbApi.softwareExternalData.saveIds(insertFlatten);

        console.timeEnd(useCaseLogTimer);

        return true;
    };
};
