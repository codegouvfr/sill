// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Expression, JSONColumnType, RawBuilder, Simplify, sql, Generated } from "kysely";

export const jsonBuildObject = <O extends Record<string, Expression<unknown>>>(
    obj: O
): RawBuilder<
    Simplify<{
        [K in keyof O]: O[K] extends Expression<infer V> ? V : never;
    }>
> => sql`json_build_object(${sql.join(Object.keys(obj).flatMap(k => [sql.lit(k), obj[k]]))})`;

type NullableToUndefined<A> = A extends null ? Exclude<A, null> | undefined : A;
type StripNullRecursive<T> = {
    [K in keyof T]: T[K] extends Record<any, unknown> ? StripNullRecursive<T[K]> : NullableToUndefined<T[K]>;
};
export const jsonStripNulls = <T>(obj: RawBuilder<T>): RawBuilder<StripNullRecursive<T>> =>
    sql`json_strip_nulls(${obj})`;

export const isNotNull = <T>(value: T | null): value is T => value !== null;

export const stripNullOrUndefinedValues = <T extends Record<string, unknown>>(
    obj: T
): { [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K] } =>
    Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)) as any;

export const transformNullToUndefined = <T extends Record<string, any>>(obj: T): TransformObjToNullToUndefined<T> => {
    const transformedObj = { ...obj } as { [K in keyof T]: T[K] };

    for (const key in obj) {
        if (transformedObj[key] === null) {
            transformedObj[key] = undefined as any;
        }
    }
    return transformedObj;
};

// Utility type to convert null to undefined
type NullToUndefined<T> = T extends null ? undefined : T;

export type TransformObjToNullToUndefined<O> = {
    [K in keyof O]: NullToUndefined<O[K]>;
};

// Utility type to remove JSONColumnType
type RemoveJSONColumnType<T> = T extends JSONColumnType<infer U> ? U : T;

// Utility type to remove Generated
type RemoveGeneratedType<T> = T extends Generated<infer U> ? U : T;

// Transform the SoftwaresTable type
export type TransformRepoToRowOutput<R> = {
    [K in keyof R]: RemoveGeneratedType<RemoveJSONColumnType<R[K]>>;
};

// Transform the SoftwaresTable type
export type TransformRepoToCleanedRow<R> = {
    [K in keyof R]: RemoveGeneratedType<NullToUndefined<RemoveJSONColumnType<R[K]>>>;
};

export const parseBigIntToNumber = <T extends Object>(obj: T, keys: (keyof T)[]) => {
    const transformedObj = { ...obj };

    keys.forEach(key => {
        if (key in obj && typeof obj[key] === "string") {
            transformedObj[key] = new Date(+transformedObj[key]).getTime() as T[keyof T];
        }
    });

    return transformedObj;
};
