import { Deferred } from "evt/tools/Deferred";
import type { Request } from "express";

export function getRequestBody(req: Request) {
    const dBody = new Deferred<Buffer>();

    const chunks: Buffer[] = [];

    req.on("data", chunk => chunks.push(chunk));

    req.on("end", () => dBody.resolve(Buffer.concat(chunks)));

    return dBody.pr;
}
