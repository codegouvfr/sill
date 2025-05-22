import { Catalogi } from "../../types/Catalogi";

export type GetScholarlyArticle = (articleId: string) => Promise<Catalogi.ScholarlyArticle | undefined>;
