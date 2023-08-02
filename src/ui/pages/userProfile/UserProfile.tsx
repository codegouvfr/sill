import { useEffect } from "react";
import { useTranslation } from "ui/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useCoreFunctions, useCoreState, selectors } from "core";
import type { PageRoute } from "./route";
import { LoadingFallback } from "ui/shared/LoadingFallback";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function UserProfile(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { userProfile } = useCoreFunctions();
    const { profile } = useCoreState(selectors.userProfile.profile);

    useEffect(() => {
        userProfile.initialize({ "email": route.params.email });

        return () => {
            userProfile.clear();
        };
    }, [route.params.email]);

    if (profile === undefined) {
        return <LoadingFallback />;
    }

    return <UserProfileReady className={className} />;
}

function UserProfileReady(props: { className?: string }) {
    const { className } = props;

    const { t } = useTranslation({ UserProfile });

    const { profile } = useCoreState(selectors.userProfile.profile);

    assert(profile !== undefined);

    return (
        <div className={className}>
            <span>{t("user profile")}</span>
            <pre>{JSON.stringify(profile, null, 4)}</pre>
        </div>
    );
}

export const { i18n } = declareComponentKeys<"user profile">()({ UserProfile });
