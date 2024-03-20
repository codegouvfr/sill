import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const softwareNameBySillId = (rootState: RootState) =>
    rootState[name].softwareNameBySillId;

export const selectors = { softwareNameBySillId };
