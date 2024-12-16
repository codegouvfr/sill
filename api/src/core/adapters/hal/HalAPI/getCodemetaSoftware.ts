import { SoftwareApplication } from "../../../../types/codemeta";
import { HalFetchError } from "./type";

export async function fetchCodeMetaSoftwareByURL(url: string): Promise<SoftwareApplication | undefined> {
    let res : Response | null = null;

    try {
        res = await fetch(`${url}/codemeta`);
    } catch(err: any) {
        if (err && (err?.stack?.includes('TimeoutError') || err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || err?.cause?.code === "UND_ERR_SOCKET")) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchCodeMetaSoftwareByURL(url);
        }
        throw new Error(err);
    }

    if (res === undefined || res === null) {
        throw new HalFetchError(undefined);    }

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
