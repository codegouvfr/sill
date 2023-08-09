import { useEffect } from "react";
import { useTranslation } from "ui/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useCoreFunctions, useCoreState, selectors } from "core";
import type { PageRoute } from "./route";
import { LoadingFallback } from "ui/shared/LoadingFallback";
import { makeStyles } from "tss-react/dsfr";
import { fr } from "@codegouvfr/react-dsfr";
import { Markdown } from "keycloakify/tools/Markdown";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { routes, session } from "ui/routes";
import { Button } from "@codegouvfr/react-dsfr/Button";

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

    const { cx, classes } = useStyles();

    return (
        <div className={cx(fr.cx("fr-container"), className)}>
            <Breadcrumb
                currentPageLabel={`${profile.email} - ${profile.organization}`}
                homeLinkProps={routes.home().link}
                segments={[
                    {
                        "label": "Users",
                        "linkProps": {}
                    }
                ]}
            />
            <div className={classes.header}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                    href={"#"}
                    onClick={() => session.back()}
                    className={classes.headerBackButton}
                >
                    <i className={fr.cx("fr-icon-arrow-left-s-line")} />
                </a>
                <h4 className={classes.headerTitle}>{t("user profile")}</h4>
                {profile.isUserProfile && (
                    <Button
                        className={classes.editProfileButton}
                        iconId="ri-pencil-line"
                        priority="secondary"
                        linkProps={routes.account().link}
                    >
                        {t("edit my profile")}
                    </Button>
                )}
            </div>
            {profile.about !== undefined ? (
                <Markdown>{profile.about}</Markdown>
            ) : (
                <p>{t("no description")}</p>
            )}
            <div className={classes.sendEmailButtonWrapper}>
                <Button
                    linkProps={{
                        "href": `mailto:${profile.email}`
                    }}
                >
                    {t("send email")}
                </Button>
            </div>
        </div>
    );
}

export const { i18n } = declareComponentKeys<
    "user profile" | "no description" | "send email" | "edit my profile"
>()({ UserProfile });

const useStyles = makeStyles({ "name": { UserProfile } })(_ => ({
    "header": {
        "display": "flex",
        "alignItems": "center",
        "marginBottom": fr.spacing("10v")
    },
    "headerTitle": {
        "marginBottom": 0
    },
    "headerBackButton": {
        "background": "none",
        "marginRight": fr.spacing("4v"),

        "&>i": {
            "&::before": {
                "--icon-size": fr.spacing("8v")
            }
        }
    },
    "editProfileButton": {
        "marginLeft": fr.spacing("4v")
    },
    "sendEmailButtonWrapper": {
        ...fr.spacing("margin", { "topBottom": "15v" }),
        "display": "flex",
        "justifyContent": "center"
    }
}));
