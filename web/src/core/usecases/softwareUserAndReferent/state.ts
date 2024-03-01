import { createUsecaseActions } from "redux-clean-architecture";
import { id } from "tsafe/id";
import type { ApiTypes } from "@codegouvfr/sill";

export type State = State.NotReady | State.Ready;

export namespace State {
    export type NotReady = {
        stateDescription: "not ready";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        softwareName: string;
        logoUrl: string | undefined;
        users: SoftwareUser[];
        referents: SoftwareReferent[];
    };

    export type SoftwareUser = {
        organization: string;
        usecaseDescription: string;
        /** NOTE: undefined if the software is not of type desktop/mobile */
        os: ApiTypes.Os | undefined;
        version: string;
        /** NOTE: Defined only when software is cloud */
        serviceUrl: string | undefined;
    };

    export type SoftwareReferent = {
        email: string;
        organization: string;
        isTechnicalExpert: boolean;
        usecaseDescription: string;
        /** NOTE: Can be not undefined only if cloud */
        serviceUrl: string | undefined;
    };
}

export const name = "softwareUserAndReferent" as const;

export const { reducer, actions } = createUsecaseActions({
    name,
    "initialState": id<State>({
        "stateDescription": "not ready",
        "isInitializing": false
    }),
    "reducers": {
        "initializationStarted": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": true
        }),
        "initializationCompleted": (
            _state,
            {
                payload
            }: {
                payload: {
                    softwareName: string;
                    logoUrl: string | undefined;
                    users: State.SoftwareUser[];
                    referents: State.SoftwareReferent[];
                };
            }
        ) => {
            const { softwareName, logoUrl, users, referents } = payload;

            return {
                "stateDescription": "ready",
                softwareName,
                logoUrl,
                users,
                referents
            };
        },
        "cleared": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": false
        })
    }
});
