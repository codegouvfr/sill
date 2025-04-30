import { SourceGateway } from "../ports/SourceGateway";
import { DatabaseDataType } from "../ports/DbApiV2";
import { halSourceGateway } from "./hal";
import { wikidataSourceGateway } from "./wikidata";

export const resolveAdapterFromSource = (source: DatabaseDataType.SourceRow): SourceGateway => {
    switch (source.kind) {
        case "HAL":
            return halSourceGateway;
        case "wikidata":
            return wikidataSourceGateway;
        default:
            const unreachableCase: never = source.kind;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
};
