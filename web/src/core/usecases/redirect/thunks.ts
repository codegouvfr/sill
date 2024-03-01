import type { Thunks } from "core/bootstrap";
import { actions } from "./state";

export const thunks = {};

export const protectedThunks = {
    "initialize":
        () =>
        async (...args) => {
            const [dispatch, , { sillApi }] = args;

            dispatch(
                actions.initialized({
                    "softwareNameBySillId": Object.fromEntries(
                        (await sillApi.getSoftwares()).map(
                            ({ softwareId, softwareName }) => [softwareId, softwareName]
                        )
                    )
                })
            );
        }
} satisfies Thunks;
