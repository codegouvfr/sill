import { HAL } from "./types/HAL";

export async function fetchCodeMetaSoftwareByURL(url: string): Promise<HAL.SoftwareApplication | undefined> {
    const res = await fetch(`${url}/codemeta`, {
        signal: AbortSignal.timeout(60000)
    }).catch(err => {
        console.error(url, err);
    });

    if (res === undefined) {
        throw new HAL.API.FetchError(undefined);
    }

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchCodeMetaSoftwareByURL(url);
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json;
}
