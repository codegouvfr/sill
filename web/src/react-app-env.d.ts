// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

/// <reference types="react-scripts" />
declare module "*.md" {
    const src: string;
    export default src;
}

declare module "urlon" {
    const URLON: {
        parse<T>(raw: string): T;
        stringify(obj: any): string;
    };
    export default URLON;
}
