import { createResolveLocalizedString } from "i18nifty/LocalizedString/reactless";
import { assert } from "tsafe/assert";
import type { Context } from "../bootstrap";
import type { Language } from "../ports/GetSoftwareExternalData";

type AutoFillData = {
    comptoirDuLibreId: number | undefined;
    softwareName: string | undefined;
    softwareDescription: string | undefined;
    softwareLicense: string | undefined;
    softwareMinimalVersion: string | undefined;
    softwareLogoUrl: string | undefined;
    keywords: string[];
};

type AutoFillDataCache = Partial<Record<string, AutoFillData>>;

export type GetSoftwareFormAutoFillDataFromExternalAndOtherSources = ReturnType<
    typeof makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources
>;
export const makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources =
    (context: Context, autoFillDataCache: AutoFillDataCache) =>
    async ({ externalId }: { externalId: string }): Promise<AutoFillData> => {
        const cachedAutoFillData = autoFillDataCache[externalId];
        if (cachedAutoFillData !== undefined) return cachedAutoFillData;

        const { getSoftwareLatestVersion, comptoirDuLibreApi, getSoftwareExternalData } = context;

        const [softwareExternalData, comptoirDuLibre] = await Promise.all([
            getSoftwareExternalData(externalId),
            comptoirDuLibreApi.getComptoirDuLibre()
        ]);

        assert(softwareExternalData !== undefined);

        const { label: externalSoftwareLabel } = softwareExternalData;

        if (externalSoftwareLabel === undefined) {
            return {
                comptoirDuLibreId: undefined,
                keywords: [],
                softwareDescription: undefined,
                softwareLicense: undefined,
                softwareLogoUrl: undefined,
                softwareMinimalVersion: undefined,
                softwareName: undefined
            };
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
    };
