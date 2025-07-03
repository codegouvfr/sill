// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Thunks } from "core/bootstrap";
import { actions } from "./state";

export const thunks = {
    removeAgentAsReferentOrUserFromSoftware:
        (params: { softwareId: number; declarationType: "user" | "referent" }) =>
        async (...args) => {
            const { declarationType, softwareId } = params;

            const [dispatch, , { sillApi }] = args;

            dispatch(actions.declarationRemovalStarted());

            await sillApi.removeUserOrReferent({
                declarationType,
                softwareId
            });

            dispatch(actions.userOrReferentRemoved());
        }
} satisfies Thunks;
