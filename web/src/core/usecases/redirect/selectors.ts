// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const softwareNameBySillId = (rootState: RootState) =>
    rootState[name].softwareNameBySillId;

export const selectors = { softwareNameBySillId };
