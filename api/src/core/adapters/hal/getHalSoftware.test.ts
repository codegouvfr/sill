import { describe, expect, it } from "vitest";
import { getHalSoftware } from "./getHalSoftware";
import { getHalSoftwareOptions } from "./getHalSoftwareOptions";

const expectToEqual = <T>(actual: T, expected: T) => {
    expect(actual).toEqual(expected);
};

describe("HAL", () => {
    describe("getHalSoftware", () => {
        it("gets data from Hal and converts it to ExternalSoftware", async () => {
            // https://api.archives-ouvertes.fr/search/?q=docid:1510897&wt=json&fl=*&sort=docid%20asc

            const result = await getHalSoftware("1715545");

            expectToEqual(result, {
                "description": { "en": "-" },
                "developers": [
                    {
                        "id": "gruenpeter,-morane",
                        "name": "Gruenpeter, Morane"
                    }
                ],
                "documentationUrl": "https://inria.hal.science/hal-01715545",
                "externalId": "1715545",
                "framaLibreId": "",
                "isLibreSoftware": true,
                "label": {
                    "en": "Battleship exercise",
                    "fr": "Battleship exercise"
                },
                "license": "MIT License",
                "logoUrl": "",
                "externalDataOrigin": "HAL",
                "sourceUrl": "https://github.com/moranegg/Battleship",
                "websiteUrl": "https://inria.hal.science/hal-01715545"
            });
        });
    });

    describe("getHalSoftwareOption", () => {
        it("gets data from Hal and converts it to ExternalSoftwareOption, and returns the provided language", async () => {
            const enOptions = await getHalSoftwareOptions({ queryString: "multisensi", language: "en" });
            expectToEqual(enOptions, [
                {
                    "externalId": "2801278",
                    "label": "multisensi",
                    "description": "Functions to perform sensitivity analysis on a model with multivariate output.",
                    "isLibreSoftware": true,
                    "externalDataOrigin": "HAL"
                }
            ]);

            const frOptions = await getHalSoftwareOptions({ queryString: "multisensi", language: "fr" });
            expectToEqual(frOptions, [
                {
                    "externalId": "2801278",
                    "label": "multisensi : Analyse de sensibilité multivariée",
                    "description": "Functions to perform sensitivity analysis on a model with multivariate output.",
                    "isLibreSoftware": true,
                    "externalDataOrigin": "HAL"
                }
            ]);
        });
    });
});
