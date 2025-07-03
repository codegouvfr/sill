import type { CreateEvt } from "core/bootstrap";
import { name } from "./state";

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.usecaseName === name && action.actionName === "notifyRequestChangeSort"
            ? [{ action: "change sort" as const, sort: action.payload.sort }]
            : null
    )) satisfies CreateEvt;
