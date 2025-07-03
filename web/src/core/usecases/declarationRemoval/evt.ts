// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { CreateEvt } from "core/bootstrap";
import { name } from "./state";

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.usecaseName === name && action.actionName === "userOrReferentRemoved"
            ? [{ action: "close modal" as const }]
            : null
    )) satisfies CreateEvt;
