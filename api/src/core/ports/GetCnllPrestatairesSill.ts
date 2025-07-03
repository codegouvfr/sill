import { z } from "zod";
import { assert } from "tsafe";
import type { Equals } from "tsafe";

export type GetCnllPrestatairesSill = {
    (): Promise<CnllPrestatairesSill[]>;
    clear: () => void;
};

export type CnllPrestatairesSill = {
    nom: string;
    prestataires: CnllPrestatairesSill.Prestataire[];
    sill_id: number;
};

export namespace CnllPrestatairesSill {
    export type Prestataire = {
        nom: string;
        siren: string;
        url: string;
    };
}

export const zCnllPrestatairesSill = z.object({
    "nom": z.string(),
    "prestataires": z.array(
        z.object({
            "nom": z.string(),
            "siren": z.string(),
            "url": z.string()
        })
    ),
    "sill_id": z.number()
});

assert<Equals<ReturnType<(typeof zCnllPrestatairesSill)["parse"]>, CnllPrestatairesSill>>();
