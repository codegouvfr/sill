// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { createRouter } from "type-route";
import { createTypeRouteMock } from "ui/tools/typeRouteMock";
import { isStorybook } from "ui/tools/isStorybook";
import { routeDefs } from "ui/pages";

const { RouteProvider, useRoute, routes: realRoutes, session } = createRouter(routeDefs);

export { RouteProvider, useRoute, session };

export const { getPreviousRouteName } = (() => {
    let previousRouteName: keyof typeof realRoutes | false = false;
    let currentRouteName: keyof typeof realRoutes | false =
        session.getInitialRoute().name;

    session.listen(nextRoute => {
        previousRouteName = currentRouteName;

        currentRouteName = nextRoute.name;
    });

    function getPreviousRouteName() {
        return previousRouteName;
    }

    return { getPreviousRouteName };
})();

const { createMockRouteFactory, routesProxy } = createTypeRouteMock({
    routes: realRoutes
});

export const routes = isStorybook ? routesProxy : realRoutes;

export { createMockRouteFactory };
