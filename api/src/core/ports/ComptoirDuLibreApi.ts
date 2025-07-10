// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { z } from "zod";
import { assert, type Equals } from "tsafe";

export type ComptoirDuLibreApi = {
    getComptoirDuLibre: {
        (): Promise<ComptoirDuLibre>;
        clear: () => void;
    };
    getIconUrl: (params: { comptoirDuLibreId: number }) => Promise<string | undefined>;
    getKeywords: (params: { comptoirDuLibreId: number }) => Promise<string[]>;
};

export type ComptoirDuLibre = {
    date_of_export: string;
    number_of_software: number;
    softwares: ComptoirDuLibre.Software[];
};
export declare namespace ComptoirDuLibre {
    export interface Provider {
        id: number;
        url: string;
        name: string;
        type: string;
        external_resources: {
            website: string | null;
        };
    }

    export interface User {
        id: number;
        url: string;
        name: string;
        type: string;
        external_resources: {
            website: string | null;
        };
    }

    export interface Software {
        id: number;
        created: string;
        modified: string;
        url: string;
        name: string;
        licence: string;
        logoUrl?: string;
        keywords?: string[];
        external_resources: {
            website: string | null;
            repository: string | null;
            wikidata: WikidataIdentifier | never[];
            sill: SILLIdentifier | never[];
            wikipedia: WikipediaIdentifier | never[];
            cnll: CNLLIdentifier | never[];
            framalibre: FramaLibreIdentifier | never[];
        };
        providers: Provider[];
        users: User[];
    }
}

type CNLLIdentifier = {
    url: string;
};

type FramaLibreIdentifier = {
    slug: string;
    url: string;
};

type WikidataIdentifier = {
    id: string;
    url: string;
    data: string;
};

type SILLIdentifier = {
    id: number;
    url: string;
    i18n_url: {
        fr?: string;
        en?: string;
    };
};

type WikipediaIdentifier = {
    url: string;
    i18n_url: {
        fr?: string;
        en?: string;
    };
};

export const { zComptoirDuLibre } = (() => {
    const zProvider = z.object({
        "id": z.number(),
        "url": z.string(),
        "name": z.string(),
        "type": z.string(),
        "external_resources": z.object({
            "website": z.union([z.string(), z.null()])
        })
    });

    assert<Equals<ComptoirDuLibre.Provider, z.infer<typeof zProvider>>>();

    const zUser = z.object({
        "id": z.number(),
        "url": z.string(),
        "name": z.string(),
        "type": z.string(),
        "external_resources": z.object({
            "website": z.union([z.string(), z.null()])
        })
    });

    assert<Equals<ComptoirDuLibre.User, z.infer<typeof zUser>>>();

    const zCNLLIdentifier = z.object({
        url: z.string()
    });

    assert<Equals<CNLLIdentifier, z.infer<typeof zCNLLIdentifier>>>();

    const zFramaLibreIdentifier = z.object({
        slug: z.string(),
        url: z.string()
    });

    assert<Equals<FramaLibreIdentifier, z.infer<typeof zFramaLibreIdentifier>>>();

    const zWikidataIdentifier = z.object({
        id: z.string(),
        url: z.string(),
        data: z.string()
    });

    assert<Equals<WikidataIdentifier, z.infer<typeof zWikidataIdentifier>>>();

    const zSILLIdentifier = z.object({
        id: z.number(),
        url: z.string(),
        i18n_url: z.object({
            fr: z.string().optional(),
            en: z.string().optional()
        })
    });

    assert<Equals<SILLIdentifier, z.infer<typeof zSILLIdentifier>>>();

    const zWikipediaIdentifier = z.object({
        url: z.string(),
        i18n_url: z.object({
            fr: z.string().optional(),
            en: z.string().optional()
        })
    });

    assert<Equals<WikipediaIdentifier, z.infer<typeof zWikipediaIdentifier>>>();

    const zSoftware: z.Schema = z.object({
        "id": z.number(),
        "created": z.string(),
        "modified": z.string(),
        "url": z.string(),
        "name": z.string(),
        "licence": z.string(),
        "logoUrl": z.string().optional(),
        "external_resources": z.object({
            "website": z.union([z.string(), z.null()]),
            "repository": z.union([z.string(), z.null()]),
            "wikidata": zWikidataIdentifier.or(z.array(z.never()).max(0)),
            "sill": zSILLIdentifier.or(z.array(z.never()).max(0)),
            "wikipedia": zWikipediaIdentifier.or(z.array(z.never()).max(0)),
            "cnll": zCNLLIdentifier.or(z.array(z.never()).max(0)),
            "framalibre": zFramaLibreIdentifier.or(z.array(z.never()).max(0))
        }),
        "providers": z.array(zProvider),
        "users": z.array(zUser)
    });

    // assert<Equals<ComptoirDuLibre.Software, z.infer<typeof zSoftware>>>();

    const zComptoirDuLibre = z.object({
        "date_of_export": z.string(),
        "number_of_software": z.number(),
        "softwares": z.array(zSoftware)
    });

    // assert<Equals<ComptoirDuLibre, z.infer<typeof zComptoirDuLibre>>>();

    return { zComptoirDuLibre };
})();
