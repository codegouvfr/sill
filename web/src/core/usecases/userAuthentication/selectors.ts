import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const currentAgent = (rootState: RootState) => {
    const state = rootState[name];
    return { currentAgent: state.currentAgent };
};

export const selectors = { currentAgent };
