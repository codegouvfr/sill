import type { Thunks } from "core/bootstrap";
import { assert } from "tsafe/assert";

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
