import { Expression, FunctionModule, RawBuilder, Simplify, sql } from "kysely";

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

export const jsonAggOrEmptyArray = <Db, E extends Expression<unknown>>(fn: FunctionModule<Db, keyof Db>, value: E) =>
    emptyArrayIfNull(fn, fn.jsonAgg(value));

export const emptyArrayIfNull = <Db, E extends Expression<unknown>>(fn: FunctionModule<Db, keyof Db>, value: E) =>
    fn.coalesce(value, sql`'[]'`);
