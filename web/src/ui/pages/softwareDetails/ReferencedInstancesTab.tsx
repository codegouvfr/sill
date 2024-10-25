import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import { fr, type FrCxArg } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { groupBy } from "lodash";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { Link } from "type-route";
import { useCore } from "../../../core";
import { routes } from "../../routes";

type InstanceInList = {
    id: number;
    organization: string;
    instanceUrl: string | undefined;
    targetAudience: string;
    isPublic: boolean;
};

export type Props = {
    className?: string;
    instanceList: InstanceInList[];
    createInstanceLink: Link;
};

type ReferenceInstancesSectionProps = {
    classname?: FrCxArg;
    instances: InstanceInList[];
    visibility: "public" | "private";
};

export const ReferencedInstancesTab = (props: Props) => {
    const { className, instanceList, createInstanceLink, ...rest } = props;
    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { t } = useTranslation({ ReferencedInstancesTab });

    const publicInstances = instanceList.filter(instance => instance.isPublic);
    const privateInstances = instanceList.filter(instance => !instance.isPublic);

    return (
        <section className={className}>
            <ReferenceInstancesSection instances={publicInstances} visibility="public" />
            <ReferenceInstancesSection
                instances={privateInstances}
                visibility="private"
                classname={"fr-mt-4w"}
            />
            <Button className={fr.cx("fr-mt-3w")} linkProps={createInstanceLink}>
                {t("add instance")}
            </Button>
        </section>
    );
};

const ReferenceInstancesSection = ({
    instances,
    visibility,
    classname
}: ReferenceInstancesSectionProps) => {
    const { userAuthentication } = useCore().functions;
    const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();
    const { classes, cx } = useStyles();
    const { t } = useTranslation({ ReferencedInstancesTab });

    if (instances.length === 0) return null;

    const instancesByOrganisation = groupBy(instances, "organization");

    if (visibility === "private" && !isUserLoggedIn) {
        return (
            <>
                <p className={fr.cx("fr-text--bold", classname)}>
                    {t("privateInstanceCount", {
                        "instanceCount": instances.length,
                        "organizationCount": Object.keys(instancesByOrganisation).length
                    })}
                </p>
                <span className={fr.cx("fr-hint-text")}>
                    {t("connect to see private instances")}
                </span>
            </>
        );
    }

    return (
        <>
            <p className={fr.cx("fr-text--bold", classname)}>
                {t(
                    visibility === "public"
                        ? "publicInstanceCount"
                        : "privateInstanceCount",
                    {
                        "instanceCount": instances.length,
                        "organizationCount": Object.keys(instancesByOrganisation).length
                    }
                )}
            </p>
            {Object.keys(instancesByOrganisation).map(organization => {
                const instancesForOrganization = instancesByOrganisation[organization];

                return (
                    <Accordion
                        key={organization}
                        label={`${organization} (${instancesForOrganization.length})`}
                    >
                        <div className={classes.accordionGrid}>
                            {instancesForOrganization.map(instance => {
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

                                            {instanceUrl && (
                                                <a
                                                    className={cx(
                                                        fr.cx(
                                                            "fr-btn",
                                                            "fr-btn--secondary"
                                                        )
                                                    )}
                                                    href={instanceUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {t("go to instance")}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion>
                );
            })}
        </>
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
          K: "publicInstanceCount";
          P: { instanceCount: number; organizationCount: number };
      }
    | {
          K: "privateInstanceCount";
          P: { instanceCount: number; organizationCount: number };
      }
    | "concerned public"
    | "go to instance"
    | "add instance"
    | "edit instance"
    | "connect to see private instances"
>()({ ReferencedInstancesTab });
