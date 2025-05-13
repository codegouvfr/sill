import { ScholarlyArticle } from "../adapters/dbApi/kysely/kysely.database";

export type GetScholarlyArticle = (articleId: string) => Promise<ScholarlyArticle | undefined>;
