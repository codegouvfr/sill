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
        external_resources: {
            website: string | null;
            repository: string | null;
        };
        providers: Provider[];
        users: User[];
    }
}

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

    const zSoftware = z.object({
        "id": z.number(),
        "created": z.string(),
        "modified": z.string(),
        "url": z.string(),
        "name": z.string(),
        "licence": z.string(),
        "external_resources": z.object({
            "website": z.union([z.string(), z.null()]),
            "repository": z.union([z.string(), z.null()])
        }),
        "providers": z.array(zProvider),
        "users": z.array(zUser)
    });

    assert<Equals<ComptoirDuLibre.Software, z.infer<typeof zSoftware>>>();

    const zComptoirDuLibre = z.object({
        "date_of_export": z.string(),
        "number_of_software": z.number(),
        "softwares": z.array(zSoftware)
    });

    assert<Equals<ComptoirDuLibre, z.infer<typeof zComptoirDuLibre>>>();

    return { zComptoirDuLibre };
})();
