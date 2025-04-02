import { SourceGateway } from "../../ports/SourceGateway";
import { getScholarlyArticle } from "./getScholarlyArticle";

type CrossRefSourceGateway = Pick<SourceGateway, "scholarlyArticle">;

export const crossRefSourceGateway: CrossRefSourceGateway = {
    scholarlyArticle: {
        getById: getScholarlyArticle
    }
};
