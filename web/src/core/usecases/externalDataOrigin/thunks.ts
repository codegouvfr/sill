import { ExternalDataOriginKind } from "api";
import type { Thunks } from "core/bootstrap";
import { createUsecaseContextApi } from "redux-clean-architecture";

const { getContext, setContext } = createUsecaseContextApi<{
    externalDataOrigin: ExternalDataOriginKind;
}>();

export const thunks = {
    getExternalDataOrigin:
        () =>
        (...args): ExternalDataOriginKind => {
            const [, , rootContext] = args;

            const { externalDataOrigin } = getContext(rootContext);

            return externalDataOrigin;
        }
} satisfies Thunks;

export const protectedThunks = {
    initialize:
        () =>
        async (...args) => {
            const [, , rootContext] = args;

            const { sillApi } = rootContext;

            setContext(rootContext, {
                externalDataOrigin: await sillApi.getExternalSoftwareDataOrigin()
            });
        }
} satisfies Thunks;
