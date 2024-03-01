import { getKcContext, type KcContext } from "keycloak-theme/account/kcContext";
import KcApp from "keycloak-theme/account/KcApp";
import type { DeepPartial } from "keycloakify/tools/DeepPartial";

export function createPageStory<PageId extends KcContext["pageId"]>(params: {
    pageId: PageId;
}) {
    const { pageId } = params;

    function PageStory(params: {
        kcContext?: DeepPartial<Extract<KcContext, { pageId: PageId }>>;
    }) {
        const { kcContext } = getKcContext({
            "mockPageId": pageId,
            "storyPartialKcContext": params.kcContext
        });

        return <KcApp kcContext={kcContext} />;
    }

    return { PageStory };
}
