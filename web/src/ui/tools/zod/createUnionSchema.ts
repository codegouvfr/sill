import { z } from "zod";

export type MappedZodLiterals<T extends readonly z.Primitive[]> = {
    -readonly [K in keyof T]: z.ZodLiteral<T[K]>;
};

function createManyUnion<
    A extends Readonly<[z.Primitive, z.Primitive, ...z.Primitive[]]>
>(literals: A) {
    return z.union(literals.map(value => z.literal(value)) as MappedZodLiterals<A>);
}

export function createUnionSchema<T extends readonly []>(values: T): z.ZodNever;
export function createUnionSchema<T extends readonly [z.Primitive]>(
    values: T
): z.ZodLiteral<T[0]>;
export function createUnionSchema<
    T extends readonly [z.Primitive, z.Primitive, ...z.Primitive[]]
>(values: T): z.ZodUnion<MappedZodLiterals<T>>;
export function createUnionSchema<T extends readonly z.Primitive[]>(values: T) {
    if (values.length > 1) {
        return createManyUnion(
            values as typeof values & [z.Primitive, z.Primitive, ...z.Primitive[]]
        );
    } else if (values.length === 1) {
        return z.literal(values[0]);
    } else if (values.length === 0) {
        return z.never();
    }
    throw new Error("Array must have a length");
}

// EXAMPLES

/*
const emptySchema = createUnionSchema([] as const);
const singletonSchema = createUnionSchema(["a"] as const);
const manySchema = createUnionSchema(["a", "b", "c"] as const);

type EmptyType = z.infer<typeof emptySchema>;
type SingletonType = z.infer<typeof singletonSchema>;
type ManyType = z.infer<typeof manySchema>;
*/
