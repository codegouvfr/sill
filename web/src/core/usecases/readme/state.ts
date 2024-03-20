import { createUsecaseActions } from "redux-clean-architecture";
import { id } from "tsafe/id";

type State = State.NotInitialized | State.Ready;

namespace State {
    export type NotInitialized = {
        stateDescription: "not initialized";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        markdown: string;
    };
}

export const name = "readme";

export const { reducer, actions } = createUsecaseActions({
    name,
    "initialState": id<State>({
        "stateDescription": "not initialized",
        "isInitializing": false
    }),
    "reducers": {
        "initializationStarted": state => {
            if (state.stateDescription === "not initialized") {
                state.isInitializing = true;
            }
        },
        "initialized": (
            _state,
            {
                payload
            }: {
                payload: {
                    markdown: string;
                };
            }
        ) => {
            const { markdown } = payload;

            return {
                "stateDescription": "ready",
                markdown
            };
        }
    }
});
