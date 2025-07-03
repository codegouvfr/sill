// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { createUsecaseActions } from "redux-clean-architecture";
import { id } from "tsafe/id";

export type State = {
    isRemovingUserDeclaration: boolean;
};

export const name = "declarationRemoval" as const;

export const { reducer, actions } = createUsecaseActions({
    name,
    initialState: id<State>({
        isRemovingUserDeclaration: false
    }),
    reducers: {
        declarationRemovalStarted: state => {
            state.isRemovingUserDeclaration = true;
        },
        userOrReferentRemoved: state => {
            state.isRemovingUserDeclaration = false;
        }
    }
});
