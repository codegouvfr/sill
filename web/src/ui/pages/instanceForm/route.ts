import { createGroup, defineRoute, createRouter, param, type Route } from "type-route";
import { appPath } from "urls";

export const routeDefs = {
    instanceCreationForm: defineRoute(
        {
            softwareName: param.query.optional.string
        },
        () => appPath + "/add-instance"
    ),
    instanceUpdateForm: defineRoute(
        {
            id: param.query.number
        },
        () => appPath + "/update-instance"
    )
};

export const routeGroup = createGroup(Object.values(createRouter(routeDefs).routes));

export type PageRoute = Route<typeof routeGroup>;

export const getDoRequireUserLoggedIn: (route: PageRoute) => boolean = () => true;
