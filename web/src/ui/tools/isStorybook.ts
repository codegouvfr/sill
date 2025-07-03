// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

/** true if the current runtime is storybook */
export const isStorybook = "__STORYBOOK_ADDONS" in window.window;
