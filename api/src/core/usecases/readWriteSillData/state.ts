import { createUsecaseActions, createObjectThatThrowsIfAccessed } from "redux-clean-architecture";
import type { Db } from "../../ports/DbApi";
import type { CompiledData } from "../../ports/CompileData";

export const name = "readWriteSillData";

type State = {
    db: Db;
    compiledData: CompiledData<"private">;
};

export const { reducer, actions } = createUsecaseActions({
    name,
    "initialState": createObjectThatThrowsIfAccessed<State>(),
    "reducers": {
        "updated": (_state, { payload }: { payload: State }) => payload
    }
});
