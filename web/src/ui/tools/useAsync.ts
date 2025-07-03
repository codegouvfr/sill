import { useEffect, useState } from "react";

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    //Must be serializable
    dependencies: any[]
): T | undefined {
    const [result, setResult] = useState<T | undefined>(undefined);

    const [cache] = useState<{
        current:
            | {
                  dependencies: any[];
                  prResult: Promise<T>;
              }
            | undefined;
    }>({
        current: undefined
    });

    useEffect(() => {
        setResult(undefined);

        let isActive = true;

        (async () => {
            let prResult: Promise<T>;

            if (
                cache.current !== undefined &&
                JSON.stringify(cache.current.dependencies) ===
                    JSON.stringify(dependencies)
            ) {
                prResult = cache.current.prResult;
            } else {
                prResult = asyncFunction();
                cache.current = {
                    dependencies,
                    prResult
                };
            }

            const result = await prResult;

            if (!isActive) {
                return;
            }

            setResult(result);
        })();

        return () => {
            isActive = false;
        };
    }, dependencies);

    return result;
}
