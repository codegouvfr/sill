export type PartialNoOptional<T> = {
    [P in keyof T]: T[P] | undefined;
};
