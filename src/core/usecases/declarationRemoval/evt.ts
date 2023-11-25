import type { CreateEvt } from "core/bootstrap";
import { name } from "./state";

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.usecaseName === name && action.actionName === "userOrReferentRemoved"
            ? [{ "action": "close modal" as const }]
            : null
    )) satisfies CreateEvt;
