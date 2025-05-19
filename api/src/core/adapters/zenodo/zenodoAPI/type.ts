export namespace Zenodo {
    export interface Creator {
        name: string;
        affiliation: string | null;
        orcid?: string;
    }

    export interface RelatedIdentifier {
        identifier: string;
        relation: string;
        resource_type: string;
        scheme: string;
    }

    export interface License {
        id: string;
    }

    export interface Community {
        id: string;
    }

    export interface VersionRelation {
        index: number;
        is_last: boolean;
        parent: {
            pid_type: string;
            pid_value: string;
        };
    }

    export interface Relations {
        version: VersionRelation[];
    }

    export interface Metadata {
        title: string;
        doi: string;
        publication_date: Date;
        description: string;
        access_right: string;
        creators: Creator[];
        related_identifiers?: RelatedIdentifier[];
        version: string;
        custom: {
            "code:codeRepository": string;
        };
        resource_type: {
            title: string;
            type: string;
        };
        license: License;
        communities?: Community[];
        relations: Relations;
        notes: string;
        keywords?: string[];
    }

    export interface Links {
        self: string;
        self_html: string;
        preview_html: string;
        doi: string;
        self_doi: string;
        self_doi_html: string;
        reserve_doi: string;
        parent: string;
        parent_html: string;
        parent_doi: string;
        parent_doi_html: string;
        self_iiif_manifest: string;
        self_iiif_sequence: string;
        files: string;
        media_files: string;
        archive: string;
        archive_media: string;
        latest: string;
        latest_html: string;
        versions: string;
        draft: string;
        access_links: string;
        access_grants: string;
        access_users: string;
        access_request: string;
        access: string;
        communities: string;
        "communities-suggestions": string;
        requests: string;
    }

    export interface File {
        id: string;
        key: string;
        size: number;
        checksum: string;
        links: {
            self: string;
        };
    }

    export interface SWH {
        swhid: string;
        origin: string;
        visit: string;
        anchor: string;
        path: string;
    }

    export interface Owner {
        id: string;
    }

    export interface Stats {
        downloads: number;
        unique_downloads: number;
        views: number;
        unique_views: number;
        version_downloads: number;
        version_unique_downloads: number;
        version_unique_views: number;
        version_views: number;
    }

    export interface Record {
        created: Date;
        modified: Date;
        id: number;
        conceptrecid: string;
        doi: string;
        conceptdoi: string;
        doi_url: string;
        metadata: Metadata;
        title: string;
        links: Links;
        updated: Date;
        recid: string;
        revision: number;
        files: File[];
        swh: SWH;
        owners: Owner[];
        status: string;
        stats: Stats;
        state: string;
        submitted: boolean;
    }
}
