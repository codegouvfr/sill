declare module "keycloak-backend" {
    export const _default: (params: any) => any;
    export default _default;
}

declare module "url-join" {
    const _default: typeof import("path").join;
    export default _default;
}
