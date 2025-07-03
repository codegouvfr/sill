// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const main = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription !== "ready") {
        return undefined;
    }

    const { stateDescription, accountManagementUrl, ...rest } = state;

    return {
        ...rest,
        doSupportAccountManagement: accountManagementUrl !== undefined
    };
};

export const selectors = { main };
