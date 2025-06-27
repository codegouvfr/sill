import { SoftwareFormData, Source } from "../usecases/readWriteSillData";

export type GetSoftwareFormData = (params: {
    externalId: string;
    source: Source;
}) => Promise<SoftwareFormData | undefined>;
