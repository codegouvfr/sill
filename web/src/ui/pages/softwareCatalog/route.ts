import {
    createGroup,
    defineRoute,
    createRouter,
    param,
    noMatch,
    type Route
} from "type-route";
import type { State } from "core/usecases/softwareCatalog";
import { z } from "zod";
import { assert, type Equals } from "tsafe";
import { appPath } from "urls";

export const routeDefs = {
    softwareCatalog: defineRoute(
        {
            search: param.query.optional.string.default(""),
            sort: param.query.optional.ofType({
                parse: raw => {
                    const schema = z.union([
                        z.literal("added_time"),
                        z.literal("update_time"),
                        z.literal("latest_version_publication_date"),
                        z.literal("user_count"),
                        z.literal("referent_count"),
                        z.literal("user_count_ASC"),
                        z.literal("referent_count_ASC"),
                        z.literal("best_match"),
                        z.literal("my_software")
                    ]);

                    assert<Equals<ReturnType<(typeof schema)["parse"]>, State.Sort>>();

                    try {
                        return schema.parse(raw);
                    } catch {
                        return noMatch;
                    }
                },
                stringify: value => value
            }),
            organization: param.query.optional.string,
            category: param.query.optional.string,
            environment: param.query.optional.ofType({
                parse: raw => {
                    const schema: z.Schema<State.Environment> = z.union([
                        z.literal("linux"),
                        z.literal("windows"),
                        z.literal("mac"),
                        z.literal("browser")
                    ]);

                    try {
                        return schema.parse(raw);
                    } catch {
                        return noMatch;
                    }
                },
                stringify: value => value
            }),
            programmingLanguage: param.query.optional.string,
            prerogatives: param.query.optional
                .ofType({
                    parse: raw => {
                        const schema: z.Schema<State["prerogatives"][number][]> = z.array(
                            z.enum([
                                "isPresentInSupportContract",
                                "isFromFrenchPublicServices",
                                "doRespectRgaa",
                                "isInstallableOnUserComputer"
                            ] as const)
                        );

                        try {
                            return schema.parse(JSON.parse(raw));
                        } catch {
                            return noMatch;
                        }
                    },
                    stringify: value => JSON.stringify(value)
                })
                .default([])
        },
        () => appPath + `/list`
    )
};

export const routeGroup = createGroup(Object.values(createRouter(routeDefs).routes));

export type PageRoute = Route<typeof routeGroup>;

export const getDoRequireUserLoggedIn: (route: PageRoute) => boolean = () => false;
