import type { CreateEvt } from "core/bootstrap";
import { name } from "./state";

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.usecaseName === name && action.actionName === "formSubmitted"
            ? [
                  {
                      action: "redirect" as const,
                      softwareName: action.payload.softwareName
                  }
              ]
            : null
    )) satisfies CreateEvt;
