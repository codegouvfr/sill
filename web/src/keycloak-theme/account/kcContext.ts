import { createGetKcContext } from "keycloakify/account";

export const { getKcContext } = createGetKcContext();

export const { kcContext } = getKcContext({
    //"mockPageId": "password.ftl"
});

export type KcContext = NonNullable<ReturnType<typeof getKcContext>["kcContext"]>;
