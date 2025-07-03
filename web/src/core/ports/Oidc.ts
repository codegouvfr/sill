// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

export declare type Oidc = Oidc.LoggedIn | Oidc.NotLoggedIn;

export declare namespace Oidc {
    export type NotLoggedIn = {
        isUserLoggedIn: false;
        login: (params: {
            doesCurrentHrefRequiresAuth: boolean;
            transformUrlBeforeRedirect?: (url: string) => string;
        }) => Promise<never>;
    };

    export type LoggedIn = {
        isUserLoggedIn: true;
        renewTokens(): Promise<void>;
        getTokens: () => { accessToken: string };
        logout: (params: { redirectTo: "home" | "current page" }) => Promise<never>;
    };
}
