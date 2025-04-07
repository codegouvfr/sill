import { SILL } from "../../types/SILL";

export type GetScholarlyArticle = (articleId: string) => Promise<SILL.ScholarlyArticle | undefined>;
