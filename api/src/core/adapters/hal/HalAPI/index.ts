import { getAllCategries, getCategoryByCode } from "./getDomains";
import { fetchHalSoftwareById, fetchHalSoftwares } from "./getHalSoftware";

export const halAPIGateway = {
    software: {
        getById: fetchHalSoftwareById,
        getAll: fetchHalSoftwares
    },
    domain: {
        getByCode: getCategoryByCode,
        gelAll: getAllCategries
    }
};
