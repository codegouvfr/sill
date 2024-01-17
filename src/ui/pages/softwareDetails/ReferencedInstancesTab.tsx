import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { groupBy } from "lodash";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { Link } from "type-route";
import { useCore } from "../../../core";
import { routes } from "../../routes";

export type Props = {
    className?: string;
    instanceList: {
        id: number;
        organization: string;
        instanceUrl: string;
        targetAudience: string;
    }[];
    createInstanceLink: Link;
};

export const ReferencedInstancesTab = (props: Props) => {
    const { className, instanceList, createInstanceLink, ...rest } = props;
    const { userAuthentication } = useCore().functions;
    const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { t } = useTranslation({ ReferencedInstancesTab });
    const { classes, cx } = useStyles();

    const groupInstanceByOrganization = groupBy(instanceList, "organization");

    return (
        <section className={className}>
            <p className={fr.cx("fr-text--bold")}>
                {t("instanceCount", {
                    "instanceCount": instanceList.length,
                    "publicOrganizationCount": Object.keys(groupInstanceByOrganization)
                        .length
                })}
            </p>
            {Object.keys(groupInstanceByOrganization).map(organization => {
                const groupedInstanceList = instanceList.filter(
                    instance => instance.organization === organization
                );

                return (
                    <Accordion
                        key={organization}
                        label={`${organization} (${groupedInstanceList.length})`}
                    >
                        <div className={classes.accordionGrid}>
                            {groupedInstanceList.map(instance => {
                                const { instanceUrl, targetAudience } = instance;
                                return (
                                    <div
                                        className={cx(fr.cx("fr-card"), classes.card)}
                                        key={instanceUrl}
                                    >
                                        <h6 className={cx(classes.name)}>
                                            {instanceUrl}
                                        </h6>
                                        <p
                                            className={cx(
                                                fr.cx("fr-text--xs"),
                                                classes.concernedPublic
                                            )}
                                        >
                                            {t("concerned public")}
                                        </p>
                                        <p
                                            className={cx(
                                                fr.cx("fr-text--sm"),
                                                classes.description
                                            )}
                                        >
                                            {targetAudience}
                                        </p>
                                        <div className={classes.footer}>
                                            {isUserLoggedIn && (
                                                <Button
                                                    className={fr.cx("fr-mr-3w")}
                                                    onClick={() =>
                                                        routes
                                                            .instanceUpdateForm({
                                                                id: instance.id
                                                            })
                                                            .push()
                                                    }
                                                >
                                                    {t("edit instance")}
                                                </Button>
                                            )}

                                            <a
                                                className={cx(
                                                    fr.cx("fr-btn", "fr-btn--secondary")
                                                )}
                                                href={instanceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {t("go to instance")}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion>
                );
            })}

            <Button className={fr.cx("fr-mt-3w")} linkProps={createInstanceLink}>
                {t("add instance")}
            </Button>
        </section>
    );
};

const useStyles = tss.withName({ ReferencedInstancesTab }).create({
    "accordionGrid": {
        "display": "grid",
        "gridTemplateColumns": `repeat(2, 1fr)`,
        "columnGap": fr.spacing("7v"),
        "rowGap": fr.spacing("3v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`
        }
    },
    "card": {
        "&&&": {
            "padding": fr.spacing("6v")
        }
    },
    "name": {
        "marginBottom": fr.spacing("3v"),
        "color": fr.colors.decisions.text.title.grey.default
    },
    "concernedPublic": {
        "color": fr.colors.decisions.text.mention.grey.default,
        "marginBottom": fr.spacing("2v")
    },
    "description": {
        "marginBottom": fr.spacing("3v")
    },
    "footer": {
        "display": "flex",
        "justifyContent": "flex-end"
    }
});

export const { i18n } = declareComponentKeys<
    | {
          K: "instanceCount";
          P: { instanceCount: number; publicOrganizationCount: number };
      }
    | "concerned public"
    | "go to instance"
    | "add instance"
    | "edit instance"
>()({ ReferencedInstancesTab });
