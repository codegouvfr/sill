import type { Thunks } from "core/bootstrap";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import type { ApiTypes } from "@codegouvfr/sill";
import { createUsecaseContextApi } from "redux-clean-architecture";
import { Evt } from "evt";
import { createResolveLocalizedString } from "i18nifty";
import { apiSoftwareToExternalCatalogSoftware } from "core/usecases/softwareCatalog";
import { exclude } from "tsafe/exclude";
import { name, actions, type State } from "./state";

export const thunks = {
    "initialize":
        (params: { softwareName: string }) =>
        async (...args) => {
            const { softwareName } = params;

            const [dispatch, getState, extraArg] = args;

            {
                const state = getState()[name];

                assert(
                    state.stateDescription === "not ready",
                    "The clear function should have been called"
                );

                if (state.isInitializing) {
                    return;
                }
            }

            const { sillApi, oidc, getUser, evtAction } = extraArg;

            {
                const context = getContext(extraArg);

                const ctx = Evt.newCtx();

                evtAction.attach(
                    action =>
                        action.usecaseName === "declarationRemoval" &&
                        action.actionName === "userOrReferentRemoved",
                    ctx,
                    () => {
                        dispatch(thunks.clear());

                        dispatch(thunks.initialize({ softwareName }));
                    }
                );

                context.detachHandlers = () => ctx.done();
            }

            dispatch(actions.initializationStarted());

            const [apiSoftwares, apiInstances] = await Promise.all([
                sillApi.getSoftwares(),
                sillApi.getInstances()
            ]);

            const software = apiSoftwareToSoftware({
                apiSoftwares,
                apiInstances,
                softwareName
            });

            const userDeclaration: { isReferent: boolean; isUser: boolean } | undefined =
                await (async () => {
                    if (!oidc.isUserLoggedIn) {
                        return undefined;
                    }

                    const [{ agents }, user] = await Promise.all([
                        sillApi.getAgents(),
                        getUser()
                    ]);

                    const agent = agents.find(agent => agent.email === user.email);

                    if (agent === undefined) {
                        return {
                            "isReferent": false,
                            "isUser": false
                        };
                    }

                    return {
                        "isReferent":
                            agent.declarations.find(
                                d =>
                                    d.softwareName === softwareName &&
                                    d.declarationType === "referent"
                            ) !== undefined,
                        "isUser":
                            agent.declarations.find(
                                d =>
                                    d.softwareName === softwareName &&
                                    d.declarationType === "user"
                            ) !== undefined
                    };
                })();

            dispatch(actions.initializationCompleted({ software, userDeclaration }));
        },
    "clear":
        () =>
        (...args) => {
            const [dispatch, getState, extraArg] = args;

            {
                const state = getState()[name];

                if (state.stateDescription === "not ready") {
                    return;
                }
            }

            {
                const context = getContext(extraArg);

                assert(context.detachHandlers !== undefined);

                context.detachHandlers();

                context.detachHandlers = undefined;
            }

            dispatch(actions.cleared());
        },
    "unreference":
        (params: { reason: string }) =>
        async (...args) => {
            const { reason } = params;

            const [dispatch, getState, { sillApi }] = args;

            const state = getState()[name];

            assert(state.stateDescription === "ready");

            dispatch(actions.unreferencingStarted());

            const time = Date.now();

            await sillApi.unreferenceSoftware({
                "softwareName": state.software.softwareName,
                reason
            });

            dispatch(actions.unreferencingCompleted({ reason, time }));
        }
} satisfies Thunks;

const { getContext } = createUsecaseContextApi(() => ({
    "detachHandlers": id<undefined | (() => void)>(undefined)
}));

function apiSoftwareToSoftware(params: {
    apiSoftwares: ApiTypes.Software[];
    apiInstances: ApiTypes.Instance[];
    softwareName: string;
}): State.Software {
    const { apiSoftwares, apiInstances, softwareName } = params;

    const apiSoftware = apiSoftwares.find(
        apiSoftware => apiSoftware.softwareName === softwareName
    );

    assert(apiSoftware !== undefined);

    const {
        softwareId,
        logoUrl,
        authors,
        officialWebsiteUrl,
        documentationUrl,
        codeRepositoryUrl,
        softwareDescription,
        latestVersion,
        parentWikidataSoftware: parentWikidataSoftware_api,
        testUrl,
        addedTime,
        dereferencing,
        prerogatives,
        comptoirDuLibreServiceProviderCount,
        comptoirDuLibreId,
        similarSoftwares: similarSoftwares_api,
        wikidataId,
        license,
        versionMin,
        softwareType,
        userAndReferentCountByOrganization,
        annuaireCnllServiceProviders,
        serviceProviders
    } = apiSoftware;

    const { resolveLocalizedString } = createResolveLocalizedString({
        "currentLanguage": "fr",
        "fallbackLanguage": "en"
    });

    const parentSoftware: State.Software["parentSoftware"] = (() => {
        if (parentWikidataSoftware_api === undefined) {
            return undefined;
        }

        in_sill: {
            const software = apiSoftwares.find(
                software => software.wikidataId === parentWikidataSoftware_api.wikidataId
            );

            if (software === undefined) {
                break in_sill;
            }

            return {
                "softwareName": software.softwareName,
                "isInSill": true
            };
        }

        return {
            "isInSill": false,
            "softwareName": resolveLocalizedString(parentWikidataSoftware_api.label),
            "url": `https://www.wikidata.org/wiki/${parentWikidataSoftware_api.wikidataId}`
        };
    })();

    return {
        softwareId,
        logoUrl,
        authors,
        officialWebsiteUrl,
        documentationUrl,
        codeRepositoryUrl,
        softwareName,
        softwareDescription,
        latestVersion,
        dereferencing,
        serviceProviders: serviceProviders ?? [],
        "referentCount": Object.values(userAndReferentCountByOrganization)
            .map(({ referentCount }) => referentCount)
            .reduce((prev, curr) => prev + curr, 0),
        "userCount": Object.values(userAndReferentCountByOrganization)
            .map(({ userCount }) => userCount)
            .reduce((prev, curr) => prev + curr, 0),
        parentSoftware,
        addedTime,
        "comptoirDuLibreServiceProviderUrl":
            comptoirDuLibreId === undefined
                ? undefined
                : `https://comptoir-du-libre.org/fr/softwares/servicesProviders/${comptoirDuLibreId}`,
        "annuaireCnllServiceProviders": annuaireCnllServiceProviders ?? [],
        "comptoirDuLibreUrl":
            comptoirDuLibreId === undefined
                ? undefined
                : `https://comptoir-du-libre.org/fr/softwares/${comptoirDuLibreId}`,
        "wikidataUrl":
            wikidataId === undefined
                ? undefined
                : `https://www.wikidata.org/wiki/${wikidataId}`,
        "instances":
            softwareType.type !== "cloud"
                ? undefined
                : apiInstances
                      .filter(instance => instance.mainSoftwareSillId === softwareId)
                      .map(instance =>
                          instance.publicUrl === undefined
                              ? undefined
                              : {
                                    "id": instance.id,
                                    "instanceUrl": instance.publicUrl,
                                    "organization": instance.organization,
                                    "targetAudience": instance.targetAudience
                                }
                      )
                      .filter(exclude(undefined)),
        "similarSoftwares": similarSoftwares_api.map(similarSoftware => {
            const software = apiSoftwareToExternalCatalogSoftware({
                apiSoftwares,
                "softwareRef": similarSoftware.isInSill
                    ? {
                          "type": "name",
                          "softwareName": similarSoftware.softwareName
                      }
                    : {
                          "type": "wikidataId",
                          "wikidataId": similarSoftware.wikidataId
                      }
            });

            if (software === undefined) {
                assert(!similarSoftware.isInSill);

                return {
                    "isInSill": false,
                    "wikidataId": similarSoftware.wikidataId,
                    "label": similarSoftware.label,
                    "description": similarSoftware.description,
                    "isLibreSoftware": similarSoftware.isLibreSoftware
                };
            }

            return {
                "isInSill": true,
                software
            };
        }),
        license,
        "prerogatives": {
            "isTestable": testUrl !== undefined,
            "isInstallableOnUserComputer":
                softwareType.type === "stack"
                    ? undefined
                    : softwareType.type === "desktop/mobile",
            "isAvailableAsMobileApp":
                softwareType.type === "desktop/mobile" &&
                (softwareType.os.android || softwareType.os.ios),
            "isPresentInSupportContract": prerogatives.isPresentInSupportContract,
            "isFromFrenchPublicServices": prerogatives.isFromFrenchPublicServices,
            "doRespectRgaa": prerogatives.doRespectRgaa ?? undefined
        },
        comptoirDuLibreServiceProviderCount,
        testUrl,
        versionMin
    };
}
