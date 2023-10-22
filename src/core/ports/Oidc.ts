export declare type Oidc = Oidc.LoggedIn | Oidc.NotLoggedIn;

export declare namespace Oidc {
    export type NotLoggedIn = {
        isUserLoggedIn: false;
        login: (params: { doesCurrentHrefRequiresAuth: boolean }) => Promise<never>;
    };

    export type LoggedIn = {
        isUserLoggedIn: true;
        renewTokens(): Promise<void>;
        getTokens: () => { accessToken: string };
        logout: (params: { redirectTo: "home" | "current page" }) => Promise<never>;
    };
}
