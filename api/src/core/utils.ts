// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

export type OmitFromExisting<T, K extends keyof T> = Omit<T, K>;

function isEmpty(value: any): boolean {
    return (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
    );
}

const isEqual = (var1: any, var2: any): boolean => {
    // Check if both values are strictly equal
    if (var1 === var2) {
        return true;
    }

    // Check if both values are of the same type
    if (typeof var1 !== typeof var2) {
        return false;
    }

    // Handle null and undefined cases
    if (var1 === null || var2 === null) {
        return var1 === var2;
    }

    // Handle arrays
    if (Array.isArray(var1) && Array.isArray(var2)) {
        if (var1.length !== var2.length) {
            return false;
        }
        for (let i = 0; i < var1.length; i++) {
            if (!isDeepIncludedInArray(var1[i], var2)) {
                return false;
            }
        }
        return true;
    }

    // Handle objects
    if (typeof var1 === "object" && typeof var2 === "object") {
        const keysA = Object.keys(var1);
        const keysB = Object.keys(var2);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (let key of keysA) {
            if (!keysB.includes(key) || !isEqual(var1[key], var2[key])) {
                console.log(var1[key], " !==", var2[key]);
                return false;
            }
        }

        return true;
    }

    // If none of the above conditions are met, the values are not equal
    return false;
};

const isDeepIncludedInArray = (var1: any, arrayToCheck: any[]): boolean => {
    return arrayToCheck.some(element => isEqual(var1, element));
};

function mergeArrays(arr1: any[], arr2: any[]): any[] {
    const merged = [...arr1, ...arr2];
    return merged.reduce((acc, item) => {
        if (isDeepIncludedInArray(item, acc)) return acc;
        return [item, ...acc];
    }, []);
}

export const mergeObjects = <T extends Object>(obj1: T, obj2: T | T[]): T => {
    if (Array.isArray(obj2)) {
        if (obj2.length === 0) return obj1;

        const [first, ...rest] = obj2;
        return mergeObjects(obj1, mergeObjects(first, rest));
    }

    // Case both objects
    if (Object.keys(obj1).length === 0) return obj2;
    if (Object.keys(obj2).length === 0) return obj2;

    const result: T = obj1;

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            const value1 = obj1[key as keyof T];
            const value2 = obj2[key as keyof T];

            if (isEmpty(value1)) {
                result[key as keyof T] = value2;
            } else if (Array.isArray(value1) && Array.isArray(value2)) {
                if (value1.length === 0) {
                    result[key as keyof T] = value2;
                } else {
                    (result[key as keyof T] as any[]) = mergeArrays(value1, value2);
                }
            } else if (typeof value1 === "object" && typeof value2 === "object") {
                (result[key as keyof T] as Object) = mergeObjects(value1 as Object, value2 as Object);
            } else {
                result[key as keyof T] = value2;
            }
        }
    }

    return result;
};
