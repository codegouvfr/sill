import type { Thunks } from "core/bootstrap";
import type { Language } from "@codegouvfr/sill";
import { name, actions } from "./state";

export const thunks = {
    "initialize":
        (params: { lang: Language }) =>
        async (...args) => {
            const { lang } = params;

            const [dispatch, getState, { sillApi }] = args;

            {
                const state = getState()[name];

                if (
                    state.stateDescription === "not initialized" &&
                    state.isInitializing
                ) {
                    return;
                }
            }

            dispatch(actions.initializationStarted());

            const markdown = await sillApi.getMarkdown({
                "name": "termsOfService",
                "language": lang
            });

            dispatch(actions.initialized({ markdown }));
        }
} satisfies Thunks;
