import type { Thunks } from "../../bootstrap";
import { createUsecaseContextApi } from "redux-clean-architecture";
import { assert } from "tsafe/assert";
import type { Language } from "../../ports/GetSoftwareExternalData";
import { createResolveLocalizedString } from "i18nifty/LocalizedString/reactless";
import { id } from "tsafe/id";
import { privateSelectors } from "./selectors";

export const thunks = {
    "getSoftwareExternalDataOptionsWithPresenceInSill":
        (params: { queryString: string; language: Language }) =>
        async (...args) => {
            const { queryString, language } = params;

            const [, getState, { getSoftwareExternalDataOptions }] = args;

            const queryResults = await getSoftwareExternalDataOptions({ queryString, language });

            const sillWikidataIds = privateSelectors.sillWikidataIds(getState());

            return queryResults.map(({ externalId, description, label, isLibreSoftware, externalDataOrigin }) => ({
                "externalId": externalId,
                "description": description,
                "label": label,
                "isInSill": sillWikidataIds.includes(externalId),
                isLibreSoftware,
                "externalDataOrigin": externalDataOrigin
            }));
        },
    "getSoftwareFormAutoFillDataFromExternalAndOtherSources":
        (params: { externalId: string }) =>
        async (...args): Promise<AutoFillData> => {
            const { externalId } = params;

            const [, , rootContext] = args;

            const { autoFillDataCache } = getContext(rootContext);

            {
                const cachedAutoFillData = autoFillDataCache[externalId];

                if (cachedAutoFillData !== undefined) {
                    return cachedAutoFillData;
                }
            }

            const { getSoftwareLatestVersion, comptoirDuLibreApi, getSoftwareExternalData } = rootContext;

            const [softwareExternalData, comptoirDuLibre] = await Promise.all([
                getSoftwareExternalData(externalId),
                comptoirDuLibreApi.getComptoirDuLibre()
            ]);

            assert(softwareExternalData !== undefined);

            const { label: externalSoftwareLabel } = softwareExternalData;

            const { comptoirDuLibreSoftware } = (() => {
                if (externalSoftwareLabel === undefined) {
                    return { "comptoirDuLibreSoftware": undefined };
                }

                const comptoirDuLibreSoftware = comptoirDuLibre.softwares.find(software => {
                    const format = (name: string) =>
                        name
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .toLowerCase()
                            .replace(/ g/, "");

                    const { resolveLocalizedString } = createResolveLocalizedString<Language>({
                        "currentLanguage": "en",
                        "fallbackLanguage": "en"
                    });

                    return format(software.name).includes(
                        format(resolveLocalizedString(externalSoftwareLabel)).substring(0, 8)
                    );
                });

                return { comptoirDuLibreSoftware };
            })();

            const [comptoirDuLibreLogoUrl, comptoirDuLibreKeywords] =
                comptoirDuLibreSoftware === undefined
                    ? [undefined, undefined]
                    : await Promise.all([
                          comptoirDuLibreApi.getIconUrl({ "comptoirDuLibreId": comptoirDuLibreSoftware.id }),
                          comptoirDuLibreApi.getKeywords({ "comptoirDuLibreId": comptoirDuLibreSoftware.id })
                      ]);

            const { resolveLocalizedString } = createResolveLocalizedString<Language>({
                "currentLanguage": "fr",
                "fallbackLanguage": "en"
            });

            const autoFillData: AutoFillData = {
                "comptoirDuLibreId": comptoirDuLibreSoftware?.id,
                "softwareName":
                    externalSoftwareLabel === undefined ? undefined : resolveLocalizedString(externalSoftwareLabel),
                "softwareDescription":
                    softwareExternalData.description === undefined
                        ? undefined
                        : resolveLocalizedString(softwareExternalData.description),
                "softwareLicense": softwareExternalData.license ?? comptoirDuLibreSoftware?.licence,
                "softwareMinimalVersion": await (async () => {
                    const repoUrl =
                        softwareExternalData.sourceUrl ??
                        comptoirDuLibreSoftware?.external_resources.repository ??
                        undefined;

                    return repoUrl === undefined
                        ? undefined
                        : getSoftwareLatestVersion(repoUrl, "quick").then(resp => resp?.semVer);
                })(),
                "softwareLogoUrl": softwareExternalData.logoUrl ?? comptoirDuLibreLogoUrl,
                "keywords": comptoirDuLibreKeywords ?? []
            };

            autoFillDataCache[externalId] = autoFillData;

            setTimeout(() => {
                delete autoFillDataCache[externalId];
            }, 3 * 60 * 1000 /* 3 hours */);

            return autoFillData;
        }
} satisfies Thunks;

type AutoFillData = {
    comptoirDuLibreId: number | undefined;
    softwareName: string | undefined;
    softwareDescription: string | undefined;
    softwareLicense: string | undefined;
    softwareMinimalVersion: string | undefined;
    softwareLogoUrl: string | undefined;
    keywords: string[];
};

const { getContext } = createUsecaseContextApi(() => ({
    "autoFillDataCache": id<{ [externalId: string]: AutoFillData }>({})
}));
