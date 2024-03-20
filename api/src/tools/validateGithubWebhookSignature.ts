import type { Request, Response } from "express";
import { getRequestBody } from "../tools/getRequestBody";
import * as crypto from "crypto";
import { assert } from "tsafe/assert";

export type GitHubWebhookReqBody = {
    ref: string;
    repository: {
        url: string;
    };
    head_commit: {
        message: string;
    };
};

export function createValidateGitHubWebhookSignature(params: { githubWebhookSecret: string }) {
    const { githubWebhookSecret } = params;

    async function validateGitHubWebhookSignature(req: Request, res: Response): Promise<GitHubWebhookReqBody> {
        const receivedHash = githubWebhookSecret === "NO VERIFY" ? null : req.header("X-Hub-Signature-256");

        if (receivedHash === undefined) {
            console.log("No authentication header");
            res.sendStatus(401);
            await new Promise<never>(() => {
                /*never*/
            });
            assert(false); // Only to make the type checker happy
        }

        const body = await getRequestBody(req);

        if (receivedHash !== null) {
            const hash = "sha256=" + crypto.createHmac("sha256", githubWebhookSecret).update(body).digest("hex");

            if (!crypto.timingSafeEqual(Buffer.from(receivedHash, "utf8"), Buffer.from(hash, "utf8"))) {
                res.sendStatus(403);
                await new Promise<never>(() => {
                    /*never*/
                });
            }

            console.log("Webhook signature OK");
        }

        return JSON.parse(body.toString("utf8"));
    }

    return { validateGitHubWebhookSignature };
}
