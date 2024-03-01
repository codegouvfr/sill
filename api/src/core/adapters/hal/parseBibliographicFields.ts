import * as bitexParser from "@retorquere/bibtex-parser";

export const parseBibliographicFields = (input: string): BibliographicFields => {
    const bib = bitexParser.parse(input);
    return bib.entries?.[0].fields as unknown as BibliographicFields;
};

type BibliographicFields = {
    author: string[];
    hal_id: string[];
    hal_version: string[];
    license: string[];
    note: string[];
    title: string[];
    url: string[];
    year: string[];
    repository: string[];
    keywords?: string[];
    month?: string;
    swhid?: string;
    file?: string;
};
