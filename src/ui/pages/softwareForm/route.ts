import { createGroup, defineRoute, createRouter, param, type Route } from "type-route";
import { appPath } from "urls";

export const routeDefs = {
    "softwareCreationForm": defineRoute(
        { "externalId": param.query.optional.string },
        () => appPath + "/add"
    ),
    "softwareUpdateForm": defineRoute(
        { "name": param.query.string },
        () => appPath + "/update"
    )
};

export const routeGroup = createGroup(Object.values(createRouter(routeDefs).routes));

export type PageRoute = Route<typeof routeGroup>;

export const getDoRequireUserLoggedIn: (route: PageRoute) => boolean = () => true;
