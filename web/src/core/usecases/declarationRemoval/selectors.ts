import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const isRemovingUserDeclaration = (rootState: RootState) =>
    rootState[name].isRemovingUserDeclaration;

export const selectors = { isRemovingUserDeclaration };
