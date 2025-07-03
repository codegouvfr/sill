// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Thunks } from "core/bootstrap";
import { createUsecaseContextApi } from "redux-clean-architecture";

const { getContext, setContext } = createUsecaseContextApi<{ version: string }>();

export const thunks = {
    getSillApiVersion:
        () =>
        (...args): string => {
            const [, , rootContext] = args;

            const { version } = getContext(rootContext);

            return version;
        }
} satisfies Thunks;

export const protectedThunks = {
    initialize:
        () =>
        async (...args) => {
            const [, , rootContext] = args;

            const { sillApi } = rootContext;

            setContext(rootContext, {
                version: await sillApi.getApiVersion()
            });
        }
} satisfies Thunks;
