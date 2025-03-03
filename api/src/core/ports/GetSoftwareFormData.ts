import { SoftwareFormData } from "../usecases/readWriteSillData";

export type GetSoftwareFormData = (externalId: string) => Promise<SoftwareFormData | undefined>;
