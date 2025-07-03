// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

//NOTE: Do not use this hook in your project, it's a hack

import { useEffect, useState } from "react";
import type { RefObject, Dispatch, SetStateAction } from "react";
import { useStateRef } from "powerhooks/useStateRef";

export type UseNumberCountUpAnimationParams = {
    metricValue: number;
    /** Default 25 */
    intervalMs?: number;
};

export function useMetricCountUpAnimation<T extends HTMLElement = any>(
    params: UseNumberCountUpAnimationParams
): {
    renderedMetricValue: number;
    ref: RefObject<T>;
} {
    const { metricValue, intervalMs = 20000 / metricValue } = params;
    const [renderedMetricValue, setRenderedMetricValue] = useState(0);
    const ref = useStateRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            animate({
                metricValue,
                intervalMs,
                setRenderedMetricValue
            });
            return;
        }

        const observer = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) {
                return;
            }

            animate({ metricValue, intervalMs, setRenderedMetricValue });
            observer.unobserve(entries[0].target);
        });

        observer.observe(element);
    }, [metricValue]);

    return { renderedMetricValue, ref };
}

const { animate } = (() => {
    type Params = {
        intervalMs: number;
        metricValue: number;
        setRenderedMetricValue: Dispatch<SetStateAction<number>>;
    };

    const awaitDelay = (params: { delayMs: number }) =>
        new Promise<void>(resolve => setTimeout(resolve, params.delayMs));

    async function animate(params: Params) {
        const { intervalMs, metricValue, setRenderedMetricValue } = params;

        let currentIntervalMs = intervalMs;

        for (
            let count = 100 > metricValue ? 0 : 100;
            count <= metricValue;
            count = count + 18
        ) {
            await awaitDelay({
                // eslint-disable-next-line no-loop-func
                delayMs: (() => {
                    if (
                        (metricValue < 40 && count <= metricValue - 7) ||
                        (metricValue >= 40 && count <= metricValue - 14)
                    ) {
                        return currentIntervalMs;
                    }

                    return (currentIntervalMs += 10);
                })()
            });
            setRenderedMetricValue(count);
        }

        setRenderedMetricValue(metricValue);
    }

    return { animate };
})();
