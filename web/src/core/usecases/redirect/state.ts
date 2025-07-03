// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import {
    createUsecaseActions,
    createObjectThatThrowsIfAccessed
} from "redux-clean-architecture";

export type State = {
    softwareNameBySillId: Record<number, string>;
};

export const name = "redirect" as const;

export const { reducer, actions } = createUsecaseActions({
    name,
    initialState: createObjectThatThrowsIfAccessed<State>(),
    reducers: {
        initialized: (_state, { payload }: { payload: State }) => payload
    }
});
