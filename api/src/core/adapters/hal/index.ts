import { fetchHalSoftwares } from "./getHalSoftware";

export const halAPIGateway = {
    software: {
        getAll: fetchHalSoftwares
    }
};
