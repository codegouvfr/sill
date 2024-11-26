import {
    createUsecaseActions,
    createObjectThatThrowsIfAccessed
} from "redux-clean-architecture";

export type Stat = {
    value: number;
    i18ref: string;
    show: boolean;
}

export type State = {
    softwareCount: Stat;
    registeredUserCount: Stat;
    agentReferentCount: Stat;
    organizationCount: Stat;
    programmerCount: Stat;
    institutionsCount: Stat;
};

export const name = "generalStats";

export const { reducer, actions } = createUsecaseActions({
    name,
    "initialState": createObjectThatThrowsIfAccessed<State>({
        "debugMessage": "Not yet initialized"
    }),
    "reducers": {
        "update": (_state, { payload }: { payload: { state: State } }) => {
            const { state } = payload;
            return state;
        }
    }
});
