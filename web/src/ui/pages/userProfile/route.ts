// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { createGroup, defineRoute, createRouter, param, type Route } from "type-route";
import { appPath } from "urls";

export const routeDefs = {
    userProfile: defineRoute(
        {
            email: param.query.string
        },
        () => appPath + "/user"
    )
};

export const routeGroup = createGroup(Object.values(createRouter(routeDefs).routes));

export type PageRoute = Route<typeof routeGroup>;

export const getDoRequireUserLoggedIn: (route: PageRoute) => boolean = () => false;
