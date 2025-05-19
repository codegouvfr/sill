import { GetSoftwareExternalDataOptions, SoftwareExternalDataOption } from "../../ports/GetSoftwareExternalDataOptions";
import { makeZenodoApi } from "./zenodoAPI";
import { Zenodo } from "./zenodoAPI/type";
import { Source } from "../../usecases/readWriteSillData";

export const getZenodoSoftwareOptions: GetSoftwareExternalDataOptions = async ({ source, queryString }) => {
    if (source.kind !== "Zenodo" && source.url !== "https://zenodo.org/")
        throw new Error(`Not a Zenodo source, was : ${source.kind}`);

    const zenodoApi = makeZenodoApi();
    const records = await zenodoApi.records.getByNameAndType(queryString, "software");

    if (!records || records.length === 0) return [];

    return records.map(record => formatRecordToSoftwareOption(record, source));
};

function formatRecordToSoftwareOption(record: Zenodo.Record, source: Source): SoftwareExternalDataOption {
    return {
        externalId: record.id.toString(),
        label: record.title,
        description: record.metadata.description,
        isLibreSoftware: record.metadata.access_right === "open", // Not sure
        sourceSlug: source.slug
    };
}
