import fetch from "node-fetch";
import memoize from "memoizee";
import * as https from "https";
import { z } from "zod";
import { zCnllPrestatairesSill, type GetCnllPrestatairesSill } from "../ports/GetCnllPrestatairesSill";

const url = "https://annuaire.cnll.fr/api/prestataires-sill.json";

export const getCnllPrestatairesSill: GetCnllPrestatairesSill = memoize(
    async () => {
        try {
            const res = await fetch(url, { "agent": new https.Agent({ "rejectUnauthorized": false }) });

            if (res.status !== 200) {
                throw new Error(`Failed to fetch ${url}`);
            }
            const text = await res.text();

            const json = JSON.parse(text);

            return z.array(zCnllPrestatairesSill).parse(json);
        } catch (error) {
            console.error(`Failed to fetch or parse ${url}: ${String(error)}`);
            return [];
        }
    },
    { "promise": true }
);
