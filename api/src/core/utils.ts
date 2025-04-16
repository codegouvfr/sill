export type OmitFromExisting<T, K extends keyof T> = Omit<T, K>;

type BuildIndex<T> = (params: { arrayOfObject: T[]; fieldObject: keyof T }) => Record<string, T>;

export const buildIndex: BuildIndex<any> = <T>({
    arrayOfObject,
    fieldObject
}: {
    arrayOfObject: T[];
    fieldObject: keyof T;
}): Record<string, T> => {
    if (arrayOfObject && arrayOfObject.length > 0 && typeof arrayOfObject[0][fieldObject] === "string") {
        return arrayOfObject.reduce(
            (acc, item) => {
                const key = item[fieldObject] as string;
                acc[key] = item;
                return acc;
            },
            {} as Record<string, T>
        );
    }
    return {};
};
