import { fetchCodeMetaSoftwareByURL } from "./getCodemetaSoftware";
import { getAllDomains, getDomainByCode } from "./getDomains";
import { fetchHalSoftwareById, fetchHalSoftwares } from "./getHalSoftware";

export const halAPIGateway = {
    software: {
        getById: fetchHalSoftwareById,
        getAll: fetchHalSoftwares,
        getCodemetaByUrl: fetchCodeMetaSoftwareByURL
    },
    domain: {
        getByCode: getDomainByCode,
        gelAll: getAllDomains
    }
};
