export function createObjectThatThrowsIfAccessed<T extends Record<string, unknown>>(params?: {
    debugMessage?: string;
}): T {
    const { debugMessage = "" } = params ?? {};

    const get: NonNullable<ProxyHandler<T>["get"]> = (...args) => {
        const [, prop] = args;

        throw new Error(`Cannot access ${String(prop)} yet ${debugMessage}`);
    };

    return new Proxy<T>({} as any, {
        get,
        "set": get
    });
}
