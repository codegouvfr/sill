import { HAL } from "../types/HAL";
import { HalFetchError } from "./type";

export async function fetchCodeMetaSoftwareByURL(url: string): Promise<HAL.SoftwareApplication | undefined> {
    const res = await fetch(`${url}/codemeta`, {
        signal: AbortSignal.timeout(10000)
    }).catch(err => {
        console.error(url, err);
    });

    if (res === undefined) {
        throw new HalFetchError(undefined);
    }

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return fetchCodeMetaSoftwareByURL(url);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json;
}
