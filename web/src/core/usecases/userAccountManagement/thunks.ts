import { assert } from "tsafe/assert";
import type { Thunks } from "core/bootstrap";
import { addParamToUrl } from "powerhooks/tools/urlSearchParams";
import { name, actions } from "./state";

export const thunks = {
    "initialize":
        () =>
        async (...args) => {
            const [dispatch, getState, { oidc, getUser, sillApi }] = args;

            {
                const state = getState()[name];

                if (state.stateDescription === "ready" || state.isInitializing) {
                    return;
                }
            }

            dispatch(actions.initializeStarted());

            assert(oidc.isUserLoggedIn);

            const user = await getUser();

            const [
                { keycloakParams },
                allowedEmailRegexpStr,
                allOrganizations,
                { agent }
            ] = await Promise.all([
                sillApi.getOidcParams(),
                sillApi.getAllowedEmailRegexp(),
                sillApi.getAllOrganizations(),
                sillApi.getAgent({ "email": user.email })
            ]);

            const { about = "", isPublic, organization } = agent;

            dispatch(
                actions.initialized({
                    allowedEmailRegexpStr,
                    "email": user.email,
                    "organization": organization,
                    "accountManagementUrl":
                        keycloakParams === undefined
                            ? undefined
                            : addParamToUrl({
                                  "url": [
                                      keycloakParams.url.replace(/\/$/, ""),
                                      "realms",
                                      keycloakParams.realm,
                                      "account"
                                  ].join("/"),
                                  "name": "referrer",
                                  "value": keycloakParams.clientId
                              }).newUrl,
                    allOrganizations,
                    about,
                    isPublic
                })
            );
        },
    "updateField":
        (
            params:
                | {
                      fieldName: "organization";
                      value: string;
                  }
                | {
                      fieldName: "aboutAndIsPublic";
                      about: string;
                      isPublic: boolean;
                  }
        ) =>
        async (...args) => {
            const [dispatch, getState, { sillApi, oidc }] = args;

            const state = getState()[name];

            dispatch(actions.updateFieldStarted(params));

            assert(state.stateDescription === "ready");

            assert(oidc.isUserLoggedIn);

            switch (params.fieldName) {
                case "organization": {
                    await sillApi.updateAgentProfile({
                        "newOrganization": params.value
                    });
                    break;
                }
                case "aboutAndIsPublic": {
                    await sillApi.updateAgentProfile({
                        "about": params.about || undefined,
                        "isPublic": params.isPublic
                    });
                    break;
                }
            }

            dispatch(actions.updateFieldCompleted(params));
        },
    "getAccountManagementUrl":
        () =>
        (...args): string => {
            const [
                ,
                getState,
                {
                    paramsOfBootstrapCore: { getCurrentLang, getIsDark }
                }
            ] = args;

            const state = getState()[name];

            assert(state.stateDescription === "ready");

            assert(state.accountManagementUrl !== undefined);

            let url = state.accountManagementUrl;

            {
                const { newUrl } = addParamToUrl({
                    url,
                    "name": "referrer_uri",
                    "value": window.location.href
                });

                url = newUrl;
            }

            {
                const { newUrl } = addParamToUrl({
                    url,
                    "name": "kc_locale",
                    "value": getCurrentLang()
                });

                url = newUrl;
            }

            {
                const { newUrl } = addParamToUrl({
                    url,
                    "name": "dark",
                    "value": `${getIsDark()}`
                });

                url = newUrl;
            }

            return url;
        }
} satisfies Thunks;
