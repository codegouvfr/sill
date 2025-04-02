export namespace CrossRef {
    export type Message<T> = {
        status: string;
        "message-type": string;
        "message-version": string;
        message: T;
    };

    export interface Work {
        indexed: DateTime;
        "reference-count": number;
        publisher: string;
        license: License[];
        "content-domain": ContentDomain;
        "short-container-title": string[];
        "published-print": DateTime;
        abstract: string;
        DOI: string;
        type: string;
        created: DateTime;
        page: string;
        source: string;
        "is-referenced-by-count": number;
        title: string[];
        prefix: string;
        volume: string;
        author: Author[];
        member: string;
        "published-online": DateTime;
        "container-title": string[];
        "original-title": string[];
        link: Link[];
        deposited: DateTime;
        score: number;
        resource: {
            primary: {
                URL: string;
            };
        };
        subtitle: string[];
        editor: Author[];
        "short-title": string[];
        issued: DateTime;
        "references-count": number;
        "alternative-id": string[];
        URL: string;
        relation: Record<string, never>;
        ISSN: string[];
        "issn-type": IssnType[];
        subject: string[];
        published: DateTime;
    }
}

type DateParts = [number, number, number][];

interface DateTime {
    "date-parts": DateParts;
    "date-time"?: string;
    timestamp?: number;
}

interface License {
    start: DateTime;
    "content-version": string;
    "delay-in-days": number;
    URL: string;
}

interface ContentDomain {
    domain: string[];
    "crossmark-restriction": boolean;
}

interface Author {
    given: string;
    family: string;
    sequence: string;
    affiliation: string[];
}

interface Link {
    URL: string;
    "content-type": string;
    "content-version": string;
    "intended-application": string;
}

interface IssnType {
    value: string;
    type: string;
}
