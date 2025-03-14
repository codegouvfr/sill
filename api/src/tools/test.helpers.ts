import { expect } from "vitest";
import { Db } from "../core/ports/DbApi";
import { DeclarationFormData, InstanceFormData, SoftwareFormData } from "../core/usecases/readWriteSillData";
import { DatabaseRow } from "../core/adapters/dbApi/kysely/kysely.database";

export const testPgUrl = "postgresql://sill:pg_password@localhost:5432/sill";

export const expectPromiseToFailWith = (promise: Promise<any>, errorMessage: string) => {
    return expect(promise).rejects.toThrow(errorMessage);
};

export const expectToEqual = <T>(actual: T, expected: T) => {
    expect(actual).toEqual(expected);
};

export const expectToMatchObject = <T>(actual: T, expected: Partial<T>) => {
    expect(actual).toMatchObject(expected);
};

const makeObjectFactory =
    <T>(defaultValue: T) =>
    (overloads: Partial<T> = {}): T => ({
        ...defaultValue,
        ...overloads
    });

export const createAgent = makeObjectFactory<Db.AgentRow>({
    about: "About the default agent",
    email: "default.agent@mail.com",
    organization: "Default Organization",
    isPublic: true
});

export const createDeclarationFormData = makeObjectFactory<DeclarationFormData>({
    declarationType: "user",
    os: "mac",
    serviceUrl: "https://example.com",
    usecaseDescription: "My description",
    version: "1"
});

export const createSoftwareFormData = makeObjectFactory<SoftwareFormData>({
    softwareType: {
        type: "desktop/mobile",
        os: {
            windows: true,
            linux: true,
            mac: true,
            android: false,
            ios: false
        }
    },
    externalId: "Q171985",
    comptoirDuLibreId: undefined,
    softwareName: "Some software",
    softwareDescription: "Some software description",
    softwareLicense: "Some software license",
    softwareMinimalVersion: "1.0.0",
    isPresentInSupportContract: true,
    isFromFrenchPublicService: true,
    similarSoftwareExternalDataIds: [],
    softwareLogoUrl: "https://example.com/logo.png",
    softwareKeywords: ["some", "keywords"],
    doRespectRgaa: true
});

export const createInstanceFormData = makeObjectFactory<InstanceFormData>({
    organization: "Default organization",
    targetAudience: "Default audience",
    mainSoftwareSillId: 1,
    instanceUrl: "https://example.com",
    isPublic: true
});

export const testSoftwareData: DatabaseRow.Softwares[] = [
    {
        name: "Software 1",
        description: "Description 1",
        license: "License 1",
        logoUrl: "Logo URL 1",
        versionMin: "1.0.0",
        referencedSinceTime: 1728462232094,
        updateTime: 1728462232094,
        dereferencing: undefined,
        isStillInObservation: true,
        parentSoftwareWikidataId: "Wikidata ID 1",
        doRespectRgaa: true,
        isFromFrenchPublicService: true,
        isPresentInSupportContract: true,
        externalId: "External ID 1",
        externalDataOrigin: "wikidata",
        comptoirDuLibreId: 4,
        softwareType: {
            "os": { "ios": false, "mac": false, "linux": true, "android": false, "windows": false },
            "type": "desktop/mobile"
        },
        workshopUrls: [],
        categories: [],
        generalInfoMd: "General Info 1",
        addedByAgentId: 1,
        keywords: [],
        lastExtraDataFetchAt: undefined
    },
    {
        name: "Software 2",
        description: "Description 2",
        license: "License",
        logoUrl: "Logo URL",
        versionMin: "1.0.0",
        referencedSinceTime: 1728462232094,
        updateTime: 1728462232094,
        dereferencing: undefined,
        isStillInObservation: true,
        parentSoftwareWikidataId: "Wikidata ID 1",
        doRespectRgaa: true,
        isFromFrenchPublicService: true,
        isPresentInSupportContract: true,
        externalId: "External ID 1",
        externalDataOrigin: "wikidata",
        comptoirDuLibreId: 8,
        softwareType: {
            "os": { "ios": false, "mac": false, "linux": true, "android": false, "windows": false },
            "type": "desktop/mobile"
        },
        workshopUrls: [],
        categories: [],
        generalInfoMd: "General Info 1",
        addedByAgentId: 1,
        keywords: [],
        lastExtraDataFetchAt: undefined
    }
];
