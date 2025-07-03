// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

export function createCompareFn<T>(params: {
    getWeight: (item: T) => number;
    order: "ascending" | "descending";
    tieBreaker?: (a: T, b: T) => number;
}) {
    const { getWeight, order, tieBreaker } = params;

    return function compareFr(a: T, b: T): number {
        const wA = getWeight(a);
        const wB = getWeight(b);
        if (wA === wB && tieBreaker !== undefined) {
            return tieBreaker(a, b);
        }

        return (() => {
            switch (order) {
                case "ascending":
                    return wA - wB;
                case "descending":
                    return wB - wA;
            }
        })();
    };
}
