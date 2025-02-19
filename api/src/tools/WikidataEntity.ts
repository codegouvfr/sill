// https://www.wikidata.org/wiki/Special:EntityData/Q110492908.json
// https://www.wikidata.org/wiki/Q110492908#/media/File:Onyxia.svg

export namespace LocalizedString {
    export type Wrap = { language: string; value: string };

    export type Single = Record<string, Wrap>;
    export type Plural = Record<string, Wrap[]>;
}

export type DataValue<Type extends "wikibase-entityid" | "string" | "text-language" | "time"> = {
    type: Type;
    value: Type extends "wikibase-entityid"
        ? {
              "entity-type": "item";
              "numeric-id": number;
              id: string;
          }
        : Type extends "string"
          ? string
          : Type extends "text-language"
            ? { text: string; language: string }
            : Type extends "time"
              ? WikidataTime
              : never;
};

export type Snak<Type extends "wikibase-entityid" | "string" | "text-language" | "time"> = {
    snaktype: "value";
    property: string;
    hash: string;
    datavalue: DataValue<Type>;
    datatype: string;
};

export type StatementClaim<Type extends "wikibase-entityid" | "string" | "text-language" | "time"> = {
    type: "statement";
    id: string;
    rank: "preferred" | "normal" | "deprecated";
    mainsnak: {
        snaktype: "value";
        property: string;
        hash: string;
        datavalue: DataValue<Type>;
        datatype: string;
    };
    qualifiers?: { [k: string]: Snak<Type>[] };
};

export type Entity = {
    pageid: number;
    ns: number;
    title: string;
    lastrevid: number;
    modified: string;
    type: "item" | string;
    id: string;
    labels: LocalizedString.Single;
    descriptions: LocalizedString.Single;
    aliases: LocalizedString.Plural;
    //By property e.g: P31
    claims: Record<string, StatementClaim<"wikibase-entityid" | "string" | "text-language" | "time">[]>;
    sitelinks: unknown;
};

// Doc : https://www.wikidata.org/wiki/Help:Dates
export type WikidataTime = {
    after: number;
    before: number;
    calendarmodel: string;
    precision: number;
    time: string;
    timezone: number;
};

export const wikidataTimeToJSDate = (date: WikidataTime): Date => {
    switch (date.precision) {
        case 9:
            return new Date(date.time.slice(1, 5));
            break;
        case 10:
            return new Date(date.time.slice(1, 8));
            break;
        case 11:
            return new Date(date.time.slice(1, 11));
            break;
        case 12:
            return new Date(date.time.slice(1, 14));
            break;
        case 13:
            return new Date(date.time.slice(1, 17));
            break;
        case 14:
            return new Date(date.time.slice(1, 21));
            break;
        default:
            throw new RangeError("The precision should be between 9 and 14");
            break;
    }
};
