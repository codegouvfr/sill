import type { Thunks } from "core/bootstrap";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import { actions } from "./state";
import siteConfig from '../../../config-theme-ui.json';

export const thunks = {};

export const protectedThunks = {
    "initialize":
        () =>
        async (...args) => {
            const [dispatch, , { sillApi, evtAction }] = args;

            const init = async () => {
                const [{ referentCount }, softwares, registeredUserCount] =
                    await Promise.all([
                        sillApi.getTotalReferentCount(),
                        sillApi.getSoftwares(),
                        sillApi.getRegisteredUserCount()
                    ]);

                dispatch(
                    actions.update({
                        "state": {
                            "agentReferentCount": {
                                value: referentCount,
                                i18ref: "agentReferentCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("agentReferentCount")
                            },
                            "organizationCount": {
                                value: softwares
                                .map(software =>
                                    Object.keys(
                                        software.userAndReferentCountByOrganization
                                    )
                                )
                                .flat()
                                .reduce(...removeDuplicates()).length,
                                i18ref: "organizationCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("organizationCount")
                            },
                            "registeredUserCount": {
                                value: registeredUserCount,
                                i18ref: "registeredUserCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("registeredUserCount")
                            },
                            "softwareCount": {
                                value: softwares.filter(
                                    software => software.dereferencing === undefined
                                ).length,
                                i18ref: "softwareCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("softwareCount")
                            },                            
                            "programmerCount": {
                                value: 15,// TODO
                                i18ref: "programmerCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("programmerCount")
                            },
                            "institutionsCount": {
                                value: 15,// TODO
                                i18ref: "institutionsCount",
                                show: siteConfig.ui.home.numbers.catgegories.includes("institutionsCount")
                            }
                        }
                    })
                );
            };

            evtAction.attach(
                action =>
                    (action.usecaseName === "softwareForm" &&
                        action.actionName === "formSubmitted") ||
                    (action.usecaseName === "declarationForm" &&
                        action.actionName === "triggerRedirect" &&
                        action.payload.isFormSubmitted) ||
                    (action.usecaseName === "declarationRemoval" &&
                        action.actionName === "userOrReferentRemoved"),
                () => init()
            );

            await init();
        }
} satisfies Thunks;
