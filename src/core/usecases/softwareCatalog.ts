/* eslint-disable array-callback-return */
import "minimal-polyfills/Object.fromEntries";
import type { Thunks, State as RootState, CreateEvt } from "../core";
import { createSelector } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { createObjectThatThrowsIfAccessed } from "redux-clean-architecture";
import type { PayloadAction } from "@reduxjs/toolkit";
import { objectKeys } from "tsafe/objectKeys";
import memoize from "memoizee";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { createCompareFn } from "../tools/compareFn";
import { exclude } from "tsafe/exclude";
import FlexSearch from "flexsearch";
import type { ApiTypes } from "@codegouvfr/sill";
import { createResolveLocalizedString } from "i18nifty";

export type State = {
    softwares: State.Software.Internal[];
    search: string;
    searchResults:
        | {
              softwareName: string;
              positions: number[];
          }[]
        | undefined;
    sort: State.Sort;
    /** Used in organizations: E.g: DINUM */
    organization: string | undefined;
    /** E.g: JavaScript */
    category: string | undefined;
    environment: State.Environment | undefined;
    prerogatives: State.Prerogative[];
    sortBackup: State.Sort;
    /** Undefined if user isn't logged in */
    userEmail: string | undefined;
};

export namespace State {
    export type Sort =
        | "added_time"
        | "update_time"
        | "latest_version_publication_date"
        | "user_count"
        | "referent_count"
        | "user_count_ASC"
        | "referent_count_ASC"
        | "best_match"
        | "my_software";

    export type Environment =
        | "linux"
        | "windows"
        | "mac"
        | "browser"
        | "stack"
        | "android"
        | "ios";

    export type Prerogative =
        | "isPresentInSupportContract"
        | "isFromFrenchPublicServices"
        | "doRespectRgaa"
        | "isInstallableOnUserComputer"
        | "isAvailableAsMobileApp"
        | "isTestable";

    export namespace Software {
        type Common = {
            logoUrl: string | undefined;
            softwareName: string;
            softwareDescription: string;
            latestVersion:
                | {
                      semVer: string;
                      publicationTime: number;
                  }
                | undefined;
            referentCount: number;
            userCount: number;
            parentSoftware:
                | ({ softwareName: string } & (
                      | { isInSill: true }
                      | { isInSill: false; url: string }
                  ))
                | undefined;
            testUrl: string | undefined;
            userDeclaration:
                | {
                      isUser: boolean;
                      isReferent: boolean;
                  }
                | undefined;
        };

        export type External = Common & {
            prerogatives: Record<Prerogative, boolean>;
            searchHighlight:
                | {
                      searchChars: string[];
                      highlightedIndexes: number[];
                  }
                | undefined;
        };

        export type Internal = Common & {
            addedTime: number;
            updateTime: number;
            categories: string[];
            organizations: string[];
            prerogatives: Record<
                Exclude<
                    Prerogative,
                    | "isInstallableOnUserComputer"
                    | "isTestable"
                    | "isAvailableAsMobileApp"
                >,
                boolean
            >;
            softwareType: ApiTypes.SoftwareType;
            search: string;
        };
    }

    export type referentCount = number;
}

export const name = "softwareCatalog" as const;

export type UpdateFilterParams<
    K extends UpdateFilterParams.Key = UpdateFilterParams.Key
> = {
    key: K;
    value: State[K];
};

export namespace UpdateFilterParams {
    export type Key = keyof Omit<
        State,
        "softwares" | "sortBackup" | "userEmail" | "searchResult"
    >;
}

export const { reducer, actions } = createSlice({
    name,
    "initialState": createObjectThatThrowsIfAccessed<State>({
        "debugMessage": "Software catalog usecase not initialized"
    }),
    //"initialState": {} as any as State,
    "reducers": {
        "initialized": (
            _state,
            {
                payload
            }: PayloadAction<{
                softwares: State.Software.Internal[];
                defaultSort: State.Sort;
                userEmail: string | undefined;
            }>
        ) => {
            const { softwares, defaultSort, userEmail } = payload;

            return {
                softwares,
                "search": "",
                "searchResults": undefined,
                "sort": defaultSort,
                "sortBackup": defaultSort,
                "organization": undefined,
                "category": undefined,
                "environment": undefined,
                "prerogatives": [],
                "referentCount": undefined,
                "isRemovingUserOrReferent": false,
                userEmail
            };
        },
        "filterUpdated": (state, { payload }: PayloadAction<UpdateFilterParams>) => {
            const { key, value } = payload;

            // @ts-expect-error
            state[key] = value;
        },
        "searchResultUpdated": (
            state,
            {
                payload
            }: PayloadAction<{
                searchResults:
                    | {
                          softwareName: string;
                          positions: number[];
                      }[]
                    | undefined;
            }>
        ) => {
            const { searchResults } = payload;

            state.searchResults = searchResults;
        },
        // NOTE: This is first and foremost an action for evtAction
        "notifyRequestChangeSort": (
            state,
            { payload }: PayloadAction<{ sort: State.Sort }>
        ) => {
            const { sort } = payload;

            if (sort === "best_match" && state.sort !== "best_match") {
                state.sortBackup = state.sort;
            }
        },
        "filterReset": state => {
            state.prerogatives = [];
            state.organization = undefined;
            state.category = undefined;
            state.environment = undefined;
            state.prerogatives = [];
        }
    }
});

export const thunks = {
    "updateFilter":
        <K extends UpdateFilterParams.Key>(params: UpdateFilterParams<K>) =>
        async (...args) => {
            const [dispatch, getState] = args;

            if (params.key === "search") {
                const { search: currentSearch, sortBackup } = getState()[name];

                const newSearch = params.value;

                if (currentSearch === "" && newSearch !== "") {
                    dispatch(
                        actions.notifyRequestChangeSort({
                            "sort": "best_match"
                        })
                    );
                }

                if (newSearch === "" && currentSearch !== "") {
                    dispatch(
                        actions.notifyRequestChangeSort({
                            "sort": sortBackup
                        })
                    );
                }
            }

            dispatch(actions.filterUpdated(params));

            update_search_results: {
                if (params.key !== "search") {
                    break update_search_results;
                }

                const newSearch = params.value;

                assert(typeof newSearch === "string");

                if (newSearch === "") {
                    dispatch(
                        actions.searchResultUpdated({
                            "searchResults": undefined
                        })
                    );

                    break update_search_results;
                }

                const { softwares } = getState()[name];

                const searchResults = await filterBySearchMemoized(softwares, newSearch);

                dispatch(
                    actions.searchResultUpdated({
                        searchResults
                    })
                );
            }
        },
    "getDefaultSort":
        () =>
        (...args) => {
            const [, getState] = args;

            return getDefaultSort({
                "userEmail": getState()[name].userEmail
            });
        }
} satisfies Thunks;

function getDefaultSort(params: { userEmail: string | undefined }): State.Sort {
    const { userEmail } = params;

    return userEmail === undefined ? "referent_count" : "my_software";
}

export const privateThunks = {
    "initialize":
        () =>
        async (...args) => {
            const [dispatch, , { sillApi, evtAction, getUser, oidc }] = args;

            const initialize = async () => {
                const [apiSoftwares, { email: userEmail }] = await Promise.all([
                    sillApi.getSoftwares(),
                    oidc.isUserLoggedIn ? getUser() : { "email": undefined }
                ] as const);

                const { agents } =
                    userEmail === undefined
                        ? { "agents": undefined }
                        : await sillApi.getAgents();

                const softwares = apiSoftwares
                    .filter(({ dereferencing }) => dereferencing === undefined)
                    .map(({ softwareName }) => {
                        const software = apiSoftwareToInternalSoftware({
                            apiSoftwares,
                            "softwareRef": {
                                "type": "name",
                                softwareName
                            },
                            "userDeclaration":
                                agents === undefined
                                    ? undefined
                                    : (() => {
                                          const agent = agents.find(
                                              agent => agent.email === userEmail
                                          );

                                          if (agent === undefined) {
                                              return undefined;
                                          }

                                          return {
                                              "isReferent":
                                                  agent.declarations.find(
                                                      declaration =>
                                                          declaration.declarationType ===
                                                              "referent" &&
                                                          declaration.softwareName ===
                                                              softwareName
                                                  ) !== undefined,
                                              "isUser":
                                                  agent.declarations.find(
                                                      declaration =>
                                                          declaration.declarationType ===
                                                              "user" &&
                                                          declaration.softwareName ===
                                                              softwareName
                                                  ) !== undefined
                                          };
                                      })()
                        });

                        assert(software !== undefined);

                        return software;
                    });

                dispatch(
                    actions.initialized({
                        softwares,
                        userEmail,
                        "defaultSort": getDefaultSort({ userEmail })
                    })
                );
            };

            await initialize();

            evtAction.attach(
                action =>
                    (action.sliceName === "softwareForm" &&
                        action.actionName === "formSubmitted") ||
                    (action.sliceName === "declarationForm" &&
                        action.actionName === "triggerRedirect" &&
                        action.payload.isFormSubmitted) ||
                    (action.sliceName === "declarationRemoval" &&
                        action.actionName === "userOrReferentRemoved"),
                () => initialize()
            );
        }
} satisfies Thunks;

export const selectors = (() => {
    const internalSoftwares = (rootState: RootState) => {
        return rootState[name].softwares;
    };
    const searchResults = (rootState: RootState) => rootState[name].searchResults;
    const sort = (rootState: RootState) => rootState[name].sort;
    const organization = (rootState: RootState) => rootState[name].organization;
    const category = (rootState: RootState) => rootState[name].category;
    const environment = (rootState: RootState) => rootState[name].environment;
    const prerogatives = (rootState: RootState) => rootState[name].prerogatives;
    const userEmail = (rootState: RootState) => rootState[name].userEmail;

    const sortOptions = createSelector(
        searchResults,
        sort,
        userEmail,
        (searchResults, sort, userEmail): State.Sort[] => {
            const sorts = [
                ...(searchResults !== undefined || sort === "best_match"
                    ? ["best_match" as const]
                    : []),
                ...(userEmail === undefined ? [] : ["my_software" as const]),
                "referent_count" as const,
                "user_count" as const,
                "added_time" as const,
                "update_time" as const,
                "latest_version_publication_date" as const,
                "user_count_ASC" as const,
                "referent_count_ASC" as const
            ];

            assert<Equals<(typeof sorts)[number], State.Sort>>();

            return sorts;
        }
    );

    const { filterAndSortBySearch } = (() => {
        const getIndexBySoftwareName = memoize(
            (softwares: State.Software.Internal[]) =>
                Object.fromEntries(
                    softwares.map(({ softwareName }, i) => [softwareName, i])
                ),
            { "max": 1 }
        );

        function filterAndSortBySearch(params: {
            searchResults: {
                softwareName: string;
                positions: number[];
            }[];
            softwares: State.Software.Internal[];
        }) {
            const { searchResults, softwares } = params;

            const indexBySoftwareName = getIndexBySoftwareName(softwares);

            return searchResults
                .map(({ softwareName }) => softwareName)
                .map((softwareName, i) => ({
                    "software": softwares[indexBySoftwareName[softwareName]],
                    "positions": new Set(searchResults[i].positions)
                }));
        }

        return { filterAndSortBySearch };
    })();

    function filterByOrganization(params: {
        softwares: State.Software.Internal[];
        organization: string;
    }) {
        const { softwares, organization } = params;

        return softwares.filter(({ organizations }) =>
            organizations.includes(organization)
        );
    }

    function filterByCategory(params: {
        softwares: State.Software.Internal[];
        category: string;
    }) {
        const { softwares, category } = params;

        return softwares.filter(({ categories }) => categories.includes(category));
    }

    function filterByEnvironnement(params: {
        softwares: State.Software.Internal[];
        environment: State.Environment;
    }) {
        const { softwares, environment } = params;

        return softwares.filter(({ softwareType }) => {
            switch (environment) {
                case "linux":
                case "mac":
                case "windows":
                case "android":
                case "ios":
                    return (
                        softwareType.type === "desktop/mobile" &&
                        softwareType.os[environment]
                    );
                case "browser":
                    return softwareType.type === "cloud";
                case "stack":
                    return softwareType.type === "stack";
            }
        });
    }

    function filterByPrerogative(params: {
        softwares: State.Software.Internal[];
        prerogative: State.Prerogative;
    }) {
        const { softwares, prerogative } = params;

        return softwares.filter(
            software =>
                ({
                    ...internalSoftwareToExternalSoftware({
                        "internalSoftware": software,
                        "positions": undefined
                    }).prerogatives,
                    ...software.prerogatives,
                    "isTestable": software.testUrl !== undefined
                }[prerogative])
        );
    }

    const softwares = createSelector(
        internalSoftwares,
        searchResults,
        sort,
        organization,
        category,
        environment,
        prerogatives,
        (
            internalSoftwares,
            searchResults,
            sort,
            organization,
            category,
            environment,
            prerogatives
        ) => {
            let tmpSoftwares = internalSoftwares;

            let positionsBySoftwareName: Map<string, Set<number>> | undefined = undefined;

            if (searchResults !== undefined) {
                const filterResults = filterAndSortBySearch({
                    searchResults,
                    "softwares": tmpSoftwares
                });

                tmpSoftwares = filterResults.map(({ software, positions }) => {
                    (positionsBySoftwareName ??= new Map()).set(
                        software.softwareName,
                        positions
                    );
                    return software;
                });
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative
                });
            }

            if (sort !== "best_match") {
                tmpSoftwares = [...tmpSoftwares].sort(
                    (() => {
                        switch (sort) {
                            case "added_time":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.addedTime,
                                    "order": "descending"
                                });
                            case "update_time":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.updateTime,
                                    "order": "descending"
                                });
                            case "latest_version_publication_date":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software =>
                                        software.latestVersion?.publicationTime ?? 0,
                                    "order": "descending",
                                    "tieBreaker": createCompareFn({
                                        "getWeight": software => software.updateTime,
                                        "order": "descending"
                                    })
                                });
                            case "referent_count":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.referentCount,
                                    "order": "descending"
                                });
                            case "referent_count_ASC":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.referentCount,
                                    "order": "ascending"
                                });
                            case "user_count":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.userCount,
                                    "order": "descending"
                                });
                            case "user_count_ASC":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software => software.userCount,
                                    "order": "ascending"
                                });
                            case "my_software":
                                return createCompareFn<State.Software.Internal>({
                                    "getWeight": software =>
                                        software.userDeclaration === undefined
                                            ? 0
                                            : software.userDeclaration.isReferent
                                            ? 2
                                            : software.userDeclaration.isUser
                                            ? 1
                                            : 0,
                                    "order": "descending"
                                });
                        }

                        assert<Equals<typeof sort, never>>(false);
                    })()
                );
            }

            return tmpSoftwares.map(software =>
                internalSoftwareToExternalSoftware({
                    "internalSoftware": software,
                    "positions": (() => {
                        if (positionsBySoftwareName === undefined) {
                            return undefined;
                        }
                        const positions = positionsBySoftwareName.get(
                            software.softwareName
                        );

                        assert(positions !== undefined);

                        return positions;
                    })()
                })
            );
        }
    );

    const organizationOptions = createSelector(
        internalSoftwares,
        searchResults,
        category,
        environment,
        prerogatives,
        (
            internalSoftwares,
            searchResults,
            category,
            environment,
            prerogatives
        ): { organization: string; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByOrganization = Object.fromEntries(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ organizations }) => organizations)
                            .reduce((prev, curr) => [...prev, ...curr], [])
                    )
                ).map(organization => [organization, 0])
            );

            let tmpSoftwares = internalSoftwares;

            if (searchResults !== undefined) {
                tmpSoftwares = filterAndSortBySearch({
                    searchResults,
                    "softwares": tmpSoftwares
                }).map(({ software }) => software);
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative
                });
            }

            tmpSoftwares.forEach(({ organizations }) =>
                organizations.forEach(
                    organization =>
                        softwareCountInCurrentFilterByOrganization[organization]++
                )
            );

            return Object.entries(softwareCountInCurrentFilterByOrganization)
                .map(([organization, softwareCount]) => ({
                    organization,
                    softwareCount
                }))
                .sort((a, b) => {
                    if (a.organization === "other" && b.organization !== "other") {
                        return 1; // Move "other" to the end
                    } else if (a.organization !== "other" && b.organization === "other") {
                        return -1; // Move "other" to the end
                    } else {
                        return b.softwareCount - a.softwareCount; // Otherwise, sort by softwareCount
                    }
                });
        }
    );

    const categoryOptions = createSelector(
        internalSoftwares,
        searchResults,
        organization,
        environment,
        prerogatives,
        (
            internalSoftwares,
            searchResults,
            organization,
            environment,
            prerogatives
        ): { category: string; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByCategory = Object.fromEntries(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ categories }) => categories)
                            .reduce((prev, curr) => [...prev, ...curr], [])
                    )
                ).map(category => [category, 0])
            );

            let tmpSoftwares = internalSoftwares;

            if (searchResults !== undefined) {
                tmpSoftwares = filterAndSortBySearch({
                    searchResults,
                    "softwares": tmpSoftwares
                }).map(({ software }) => software);
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative
                });
            }

            tmpSoftwares.forEach(({ categories }) =>
                categories.forEach(
                    category => softwareCountInCurrentFilterByCategory[category]++
                )
            );

            return Object.entries(softwareCountInCurrentFilterByCategory)
                .map(([category, softwareCount]) => ({
                    category,
                    softwareCount
                }))
                .filter(({ softwareCount }) => softwareCount !== 0)
                .sort((a, b) => b.softwareCount - a.softwareCount);
        }
    );

    const environmentOptions = createSelector(
        internalSoftwares,
        searchResults,
        organization,
        category,
        prerogatives,
        (
            internalSoftwares,
            searchResults,
            organization,
            category,
            prerogatives
        ): { environment: State.Environment; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByEnvironment = new Map(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ softwareType }): State.Environment[] => {
                                switch (softwareType.type) {
                                    case "cloud":
                                        return ["browser"];
                                    case "stack":
                                        return ["stack" as const];
                                    case "desktop/mobile":
                                        return objectKeys(softwareType.os).filter(
                                            os => softwareType.os[os]
                                        );
                                }
                                assert(
                                    false,
                                    `Unrecognized software type: ${JSON.stringify(
                                        softwareType
                                    )}`
                                );
                            })
                            .reduce((prev, curr) => [...prev, ...curr], [])
                    )
                ).map(environment => [environment, id<number>(0)] as const)
            );

            let tmpSoftwares = internalSoftwares;

            if (searchResults !== undefined) {
                tmpSoftwares = filterAndSortBySearch({
                    "softwares": tmpSoftwares,
                    searchResults
                }).map(({ software }) => software);
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative
                });
            }

            tmpSoftwares.forEach(({ softwareType }) => {
                switch (softwareType.type) {
                    case "cloud":
                        softwareCountInCurrentFilterByEnvironment.set(
                            "browser",
                            softwareCountInCurrentFilterByEnvironment.get("browser")! + 1
                        );
                        break;
                    case "stack":
                        softwareCountInCurrentFilterByEnvironment.set(
                            "stack",
                            softwareCountInCurrentFilterByEnvironment.get("stack")! + 1
                        );
                        break;
                    case "desktop/mobile":
                        objectKeys(softwareType.os)
                            .filter(os => softwareType.os[os])
                            .forEach(os =>
                                softwareCountInCurrentFilterByEnvironment.set(
                                    os,
                                    softwareCountInCurrentFilterByEnvironment.get(os)! + 1
                                )
                            );
                        break;
                }
            });

            return Array.from(softwareCountInCurrentFilterByEnvironment.entries())
                .map(([environment, softwareCount]) => ({
                    environment,
                    softwareCount
                }))
                .sort((a, b) => b.softwareCount - a.softwareCount);
        }
    );

    const prerogativeFilterOptions = createSelector(
        internalSoftwares,
        searchResults,
        organization,
        category,
        environment,
        prerogatives,
        (
            internalSoftwares,
            searchResults,
            organization,
            category,
            environment,
            prerogatives
        ): { prerogative: State.Prerogative; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByPrerogative = new Map(
                [
                    ...Array.from(
                        new Set(
                            internalSoftwares
                                .map(({ prerogatives }) =>
                                    objectKeys(prerogatives).filter(
                                        prerogative => prerogatives[prerogative]
                                    )
                                )
                                .reduce((prev, curr) => [...prev, ...curr], [])
                        )
                    ),
                    "isInstallableOnUserComputer" as const,
                    "isTestable" as const
                ].map(prerogative => [prerogative, id<number>(0)] as const)
            );

            let tmpSoftwares = internalSoftwares;

            if (searchResults !== undefined) {
                tmpSoftwares = filterAndSortBySearch({
                    "softwares": tmpSoftwares,
                    searchResults
                }).map(({ software }) => software);
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative
                });
            }

            tmpSoftwares.forEach(({ prerogatives, softwareType, testUrl }) => {
                objectKeys(prerogatives)
                    .filter(prerogative => prerogatives[prerogative])
                    .forEach(prerogative => {
                        const currentCount =
                            softwareCountInCurrentFilterByPrerogative.get(prerogative);

                        assert(currentCount !== undefined);

                        softwareCountInCurrentFilterByPrerogative.set(
                            prerogative,
                            currentCount + 1
                        );
                    });

                (["isInstallableOnUserComputer", "isTestable"] as const).forEach(
                    prerogativeName => {
                        switch (prerogativeName) {
                            case "isInstallableOnUserComputer":
                                if (softwareType.type !== "desktop/mobile") {
                                    return;
                                }
                                break;
                            case "isTestable":
                                if (testUrl === undefined) {
                                    return;
                                }
                                break;
                        }

                        const currentCount =
                            softwareCountInCurrentFilterByPrerogative.get(
                                prerogativeName
                            );

                        assert(currentCount !== undefined);

                        softwareCountInCurrentFilterByPrerogative.set(
                            prerogativeName,
                            currentCount + 1
                        );
                    }
                );
            });

            /** prettier-ignore */
            return Array.from(softwareCountInCurrentFilterByPrerogative.entries())
                .map(([prerogative, softwareCount]) => ({ prerogative, softwareCount }))
                .filter(({ prerogative }) => prerogative !== "isTestable"); //NOTE: remove when we reintroduce Onyxia SILL
        }
    );

    return {
        softwares,
        organizationOptions,
        categoryOptions,
        environmentOptions,
        prerogativeFilterOptions,
        sortOptions
    };
})();

function apiSoftwareToInternalSoftware(params: {
    apiSoftwares: ApiTypes.Software[];
    softwareRef:
        | {
              type: "wikidataId";
              wikidataId: string;
          }
        | {
              type: "name";
              softwareName: string;
          };
    userDeclaration:
        | {
              isUser: boolean;
              isReferent: boolean;
          }
        | undefined;
}): State.Software.Internal | undefined {
    const { apiSoftwares, softwareRef, userDeclaration } = params;

    const apiSoftware = apiSoftwares.find(apiSoftware => {
        switch (softwareRef.type) {
            case "name":
                return apiSoftware.softwareName === softwareRef.softwareName;
            case "wikidataId":
                return apiSoftware.wikidataId === softwareRef.wikidataId;
        }
    });

    if (apiSoftware === undefined) {
        return undefined;
    }

    const {
        softwareName,
        logoUrl,
        softwareDescription,
        latestVersion,
        parentWikidataSoftware,
        testUrl,
        addedTime,
        updateTime,
        categories,
        prerogatives,
        softwareType,
        userAndReferentCountByOrganization,
        similarSoftwares,
        keywords
    } = apiSoftware;

    assert<
        Equals<ApiTypes.Software["prerogatives"], State.Software.Internal["prerogatives"]>
    >();

    const { resolveLocalizedString } = createResolveLocalizedString({
        "currentLanguage": "fr",
        "fallbackLanguage": "en"
    });

    const parentSoftware: State.Software.Internal["parentSoftware"] = (() => {
        if (parentWikidataSoftware === undefined) {
            return undefined;
        }

        in_sill: {
            const software = apiSoftwares.find(
                software => software.wikidataId === parentWikidataSoftware.wikidataId
            );

            if (software === undefined) {
                break in_sill;
            }

            return {
                "softwareName": software.softwareName,
                "isInSill": true
            };
        }

        return {
            "isInSill": false,
            "softwareName": resolveLocalizedString(parentWikidataSoftware.label),
            "url": `https://www.wikidata.org/wiki/${parentWikidataSoftware.wikidataId}`
        };
    })();

    return {
        logoUrl,
        softwareName,
        softwareDescription,
        latestVersion,
        "referentCount": Object.values(userAndReferentCountByOrganization)
            .map(({ referentCount }) => referentCount)
            .reduce((prev, curr) => prev + curr, 0),
        "userCount": Object.values(userAndReferentCountByOrganization)
            .map(({ userCount }) => userCount)
            .reduce((prev, curr) => prev + curr, 0),
        testUrl,
        addedTime,
        updateTime,
        categories,
        "organizations": objectKeys(userAndReferentCountByOrganization),
        parentSoftware,
        softwareType,
        prerogatives,
        "search": (() => {
            const search =
                softwareName +
                " (" +
                [
                    ...keywords,
                    ...similarSoftwares
                        .map(similarSoftware =>
                            similarSoftware.isInSill
                                ? similarSoftware.softwareName
                                : resolveLocalizedString(similarSoftware.label)
                        )
                        .map(name =>
                            name === "VSCodium"
                                ? ["vscode", "tVisual Studio Code", "VSCodium"]
                                : name
                        )
                        .flat(),
                    parentSoftware === undefined ? undefined : parentSoftware.softwareName
                ]
                    .filter(exclude(undefined))
                    .join(", ") +
                ")";

            return search;
        })(),
        userDeclaration
    };
}

function internalSoftwareToExternalSoftware(params: {
    internalSoftware: State.Software.Internal;
    positions: Set<number> | undefined;
}): State.Software.External {
    const { internalSoftware, positions } = params;

    const {
        logoUrl,
        softwareName,
        softwareDescription,
        latestVersion,
        referentCount,
        userCount,
        testUrl,
        addedTime,
        updateTime,
        categories,
        organizations,
        prerogatives: {
            isFromFrenchPublicServices,
            isPresentInSupportContract,
            doRespectRgaa
        },
        search,
        parentSoftware,
        softwareType,
        userDeclaration,
        ...rest
    } = internalSoftware;

    assert<Equals<typeof rest, {}>>();

    return {
        logoUrl,
        softwareName,
        softwareDescription,
        latestVersion,
        referentCount,
        userCount,
        testUrl,
        "prerogatives": {
            isFromFrenchPublicServices,
            isPresentInSupportContract,
            doRespectRgaa,
            "isInstallableOnUserComputer":
                softwareType.type === "desktop/mobile" &&
                (softwareType.os.windows || softwareType.os.linux || softwareType.os.mac),
            "isAvailableAsMobileApp":
                softwareType.type === "desktop/mobile" &&
                (softwareType.os.android || softwareType.os.ios),
            "isTestable": testUrl !== undefined
        },
        parentSoftware,
        "searchHighlight":
            positions === undefined
                ? undefined
                : {
                      "searchChars": search.normalize().split(""),
                      "highlightedIndexes": Array.from(positions)
                  },
        userDeclaration
    };
}

export function apiSoftwareToExternalCatalogSoftware(params: {
    apiSoftwares: ApiTypes.Software[];
    softwareRef:
        | {
              type: "wikidataId";
              wikidataId: string;
          }
        | {
              type: "name";
              softwareName: string;
          };
}): State.Software.External | undefined {
    const { apiSoftwares, softwareRef } = params;

    const internalSoftware = apiSoftwareToInternalSoftware({
        apiSoftwares,
        softwareRef,
        "userDeclaration": undefined
    });

    if (internalSoftware === undefined) {
        return undefined;
    }

    return internalSoftwareToExternalSoftware({
        internalSoftware,
        "positions": undefined
    });
}

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.sliceName === name && action.actionName === "notifyRequestChangeSort"
            ? [{ "action": "change sort" as const, sort: action.payload.sort }]
            : null
    )) satisfies CreateEvt;

const { filterBySearchMemoized } = (() => {
    const getFlexSearch = memoize(
        (softwares: State.Software.Internal[]) => {
            const index = new FlexSearch.Document<State.Software.Internal>({
                "document": {
                    "id": "softwareName",
                    "field": ["search"]
                },
                "cache": 100,
                "tokenize": "full",
                "context": {
                    "resolution": 9,
                    "depth": 2,
                    "bidirectional": true
                }
            });

            softwares.forEach(software => index.add(software));

            return index;
        },
        { "max": 1 }
    );

    function highlightMatches(params: { text: string; search: string }) {
        const { text, search } = params;

        const escapedSearch = search.trim().replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
        const regexp = RegExp("(" + escapedSearch.replaceAll(" ", "|") + ")", "ig");
        let result;
        const highlights: number[] = [];

        if (text) {
            while ((result = regexp.exec(text)) !== null) {
                for (let i = result.index; i < regexp.lastIndex; i++) {
                    highlights.push(i);
                }
            }
        }

        return highlights;
    }

    const filterBySearchMemoized = memoize(
        async (
            softwares: State.Software.Internal[],
            search: string
        ): Promise<
            {
                softwareName: string;
                positions: number[];
            }[]
        > => {
            const index = getFlexSearch(softwares);

            const searchResult = index.search(search, undefined, {
                "bool": "or",
                "suggest": true,
                "enrich": true
            });

            if (searchResult.length === 0) {
                return [];
            }

            const [{ result: softwareNames }] = searchResult;

            return softwareNames.map(
                softwareName => (
                    assert(typeof softwareName === "string"),
                    {
                        softwareName,
                        "positions": highlightMatches({
                            "text": (() => {
                                const software = softwares.find(
                                    software => software.softwareName === softwareName
                                );

                                assert(software !== undefined);

                                return software.search;
                            })(),
                            search
                        })
                    }
                )
            );
        },
        { "max": 1, "promise": true }
    );

    return { filterBySearchMemoized };
})();
