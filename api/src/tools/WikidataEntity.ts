// https://www.wikidata.org/wiki/Special:EntityData/Q110492908.json
// https://www.wikidata.org/wiki/Q110492908#/media/File:Onyxia.svg

export namespace LocalizedString {
    export type Wrap = { language: string; value: string };

    export type Single = Record<string, Wrap>;
    export type Plural = Record<string, Wrap[]>;
}

export type DataValue<Type extends "wikibase-entityid" | "string" | "text-language"> = {
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
        : never;
};

export type StatementClaim<Type extends "wikibase-entityid" | "string" | "text-language"> = {
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
    claims: Record<string, StatementClaim<"wikibase-entityid" | "string" | "text-language">[]>;
    sitelinks: unknown;
};
