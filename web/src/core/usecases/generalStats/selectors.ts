import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const main = (state: RootState) => state[name];

export const selectors = { main };
