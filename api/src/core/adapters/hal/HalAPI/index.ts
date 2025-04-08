import { getArticleById } from "./getArticle";
import { fetchCodeMetaSoftwareByURL } from "./getCodemetaSoftware";
import { getAllDomains, getDomainByCode } from "./getDomains";
import { fetchHalSoftwareById, fetchHalSoftwares } from "./getHalSoftware";
import { getHalStructureByAcronym, getHalStructureById } from "./getStructure";

export const halAPIGateway = {
    software: {
        getById: fetchHalSoftwareById,
        getAll: fetchHalSoftwares,
        getCodemetaByUrl: fetchCodeMetaSoftwareByURL
    },
    domain: {
        getByCode: getDomainByCode,
        gelAll: getAllDomains
    },
    structure: {
        getById: getHalStructureById,
        getByAcronym: getHalStructureByAcronym
    },
    article: {
        getById: getArticleById
    }
};
