import { PrimarySourceGateway, SecondarySourceGateway } from "../ports/SourceGateway";
import { DatabaseDataType } from "../ports/DbApiV2";
import { halSourceGateway } from "./hal";
import { wikidataSourceGateway } from "./wikidata";
import { comptoirDuLibreSourceGateway } from "./comptoirDuLibre";
import { cNLLSourceGateway } from "./CNLL";

export const resolveAdapterFromSource = (
    source: DatabaseDataType.SourceRow
): PrimarySourceGateway | SecondarySourceGateway => {
    switch (source.kind) {
        case "HAL":
            return halSourceGateway;
        case "wikidata":
            return wikidataSourceGateway;
        case "ComptoirDuLibre":
            return comptoirDuLibreSourceGateway;
        case "CNLL":
            return cNLLSourceGateway;
        default:
            const unreachableCase: never = source.kind;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
};
