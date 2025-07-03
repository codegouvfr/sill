import type { CreateEvt } from "core/bootstrap";
import { assert } from "tsafe/assert";
import { name } from "./state";

export const createEvt = (({ evtAction, getState }) => {
    return evtAction.pipe(action =>
        action.usecaseName === name && action.actionName === "triggerRedirect"
            ? [
                  {
                      action: "redirect" as const,
                      softwareName: (() => {
                          const state = getState()[name];

                          assert(state.stateDescription === "ready");

                          return state.software.softwareName;
                      })()
                  }
              ]
            : null
    );
}) satisfies CreateEvt;
