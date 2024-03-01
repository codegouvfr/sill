import fetch from "node-fetch";
import { type ComptoirDuLibreApi, zComptoirDuLibre } from "../ports/ComptoirDuLibreApi";
import cheerio, { type CheerioAPI, type Cheerio, type Element } from "cheerio";
import memoize from "memoizee";

const url = "https://comptoir-du-libre.org/public/export/comptoir-du-libre_export_v1.json";

export const comptoirDuLibreApi: ComptoirDuLibreApi = {
    "getComptoirDuLibre": memoize(
        async () => {
            try {
                const res = await fetch(url);

                if (res.status !== 200) {
                    throw new Error(`Failed to fetch ${url}`);
                }
                const text = await res.text();

                const json = JSON.parse(text);

                return zComptoirDuLibre.parse(json);
            } catch (error) {
                console.error(`Failed to fetch or parse ${url}: ${String(error)}`);
                return {
                    "date_of_export": Date.now().toString(),
                    "number_of_software": 0,
                    "softwares": []
                };
            }
        },
        { "promise": true }
    ),
    "getIconUrl": async ({ comptoirDuLibreId }) => {
        let imgSrc: string | undefined;

        try {
            const body = await fetch(`https://comptoir-du-libre.org/fr/softwares/${comptoirDuLibreId}`).then(r =>
                r.text()
            );

            const $ = cheerio.load(body);

            imgSrc = $(".size-logo-overview img").attr("src");
        } catch {
            return undefined;
        }

        if (imgSrc === undefined) {
            return undefined;
        }

        return `https://comptoir-du-libre.org/${imgSrc}`;
    },
    "getKeywords": async ({ comptoirDuLibreId }) => {
        let $: CheerioAPI;

        try {
            const body = await fetch(`https://comptoir-du-libre.org/fr/softwares/${comptoirDuLibreId}`).then(r =>
                r.text()
            );

            $ = cheerio.load(body);
        } catch {
            return [];
        }

        const keywords: string[] = [];

        let tagContainer: Cheerio<Element>;

        try {
            tagContainer = $(".tagsContainer");
        } catch {
            return [];
        }

        tagContainer.each(() => {
            let keyword: string;

            try {
                keyword = $(this).find(".tagUnit").text().trim();
            } catch {
                return;
            }

            keywords.push(keyword);
        });

        return keywords;
    }
};
