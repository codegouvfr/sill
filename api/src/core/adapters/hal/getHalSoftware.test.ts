import { describe, it } from "vitest";
import { expectToEqual } from "../../../tools/test.helpers";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";
import { getHalSoftwareOptions } from "./getHalSoftwareOptions";

describe("HAL", () => {
    describe("getHalSoftwareExternalData", () => {
        it("gets data from Hal and converts it to ExternalSoftware", async () => {
            // https://api.archives-ouvertes.fr/search/?q=docid:1510897&wt=json&fl=*&sort=docid%20asc

            const result = await getHalSoftwareExternalData("1715545");

            expectToEqual(result, {
                "description": { "en": "-", "fr": undefined },
                "developers": [
                    {
                        "@type": "Person",
                        "affiliation": [],
                        "identifier": "0000-0002-9777-5560",
                        "name": "Morane Gruenpeter",
                        "url": "https://orcid.org/0000-0002-9777-5560"
                    }
                ],
                "documentationUrl": undefined,
                "externalId": "1715545",
                "framaLibreId": undefined,
                "isLibreSoftware": true,
                "label": {
                    "en": "Battleship exercise",
                    "fr": "Battleship exercise"
                },
                "license": "MIT License",
                "logoUrl": undefined,
                "externalDataOrigin": "HAL",
                "sourceUrl": "https://github.com/moranegg/Battleship",
                "websiteUrl": "https://inria.hal.science/hal-01715545v1",
                "softwareVersion": undefined,
                "keywords": undefined,
                "programmingLanguages": undefined,
                "applicationCategories": ["Computer Science [cs]"],
                "publicationTime": new Date(1521545908000)
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
