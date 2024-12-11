import type { Thunks } from "core/bootstrap";
import { assert } from "tsafe/assert";
import { name, actions } from "./state";

export const protectedThunks = {
    initialize:
        () =>
        async (dispatch, getState, { sillApi, oidc, getUser }) => {
            console.log("OIDC : is user logged in ?", oidc.isUserLoggedIn);
            if (!oidc.isUserLoggedIn) return;
            const state = getState()[name];
            if (state.stateDescription === "ready" || state.isInitializing) return;
            dispatch(actions.initializationStarted());
            const user = await getUser();
            const { agent } = await sillApi.getAgent({ "email": user.email });
            dispatch(actions.initialized({ agent }));
        }
} satisfies Thunks;

export const thunks = {
    "getIsUserLoggedIn":
        () =>
        (...args): boolean => {
            const [, , { oidc }] = args;
            return oidc.isUserLoggedIn;
        },
    "login":
        (params: { doesCurrentHrefRequiresAuth: boolean }) =>
        (...args): Promise<never> => {
            const { doesCurrentHrefRequiresAuth } = params;

            const [, , { oidc }] = args;

            assert(!oidc.isUserLoggedIn);

            return oidc.login({ doesCurrentHrefRequiresAuth });
        },
    "register":
        () =>
        (...args): Promise<never> => {
            const [, , { oidc }] = args;

            assert(!oidc.isUserLoggedIn);

            return oidc.login({
                "doesCurrentHrefRequiresAuth": false,
                "transformUrlBeforeRedirect": url => {
                    const urlObj = new URL(url);

                    urlObj.pathname = urlObj.pathname.replace(
                        /\/auth$/,
                        "/registrations"
                    );

                    return urlObj.href;
                }
            });
        },
    "logout":
        (params: { redirectTo: "home" | "current page" }) =>
        (...args): Promise<never> => {
            const { redirectTo } = params;

            const [, , { oidc }] = args;

            assert(oidc.isUserLoggedIn);

            return oidc.logout({ redirectTo });
        }
} satisfies Thunks;
