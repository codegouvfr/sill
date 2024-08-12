import { useState } from "react";
import { tss } from "tss-react";
import { keyframes } from "tss-react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import { routes } from "ui/routes";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import Card from "@codegouvfr/react-dsfr/Card";
import illustration_sill from "ui/assets/illustration_sill.svg";
import { useCoreState } from "core";
import type { PageRoute } from "./route";
import { useMetricCountUpAnimation } from "ui/tools/useMetricCountUpAnimation";
import { Waypoint } from "react-waypoint";
import { ReactComponent as HomepageWaveSvg } from "ui/assets/homepage_wave.svg";
import codingSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/coding.svg";
import humanCooperationSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/environment/human-cooperation.svg";
import documentSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/document/document.svg";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Home(props: Props) {
    const { className, route, ...rest } = props;

    assert<Equals<typeof rest, {}>>();

    const { cx, classes, css } = useStyles();
    const { t } = useTranslation({ Home });

    const stats = useCoreState("generalStats", "main");

    const softwareSelectionList = [
        {
            "title": t("last added"),
            "linkProps": routes.softwareCatalog({
                "sort": "added_time"
            }).link
        },
        {
            "title": t("most used"),
            "linkProps": routes.softwareCatalog({
                "sort": "user_count"
            }).link
        },
        {
            "title": t("essential"),
            "linkProps": routes.softwareCatalog({
                "prerogatives": ["isInstallableOnUserComputer"]
            }).link
        },
        {
            "title": t("recently updated"),
            "linkProps": routes.softwareCatalog({
                "sort": "latest_version_publication_date"
            }).link
        },
        {
            "title": t("waiting for referent"),
            "linkProps": routes.softwareCatalog({
                "sort": "referent_count_ASC"
            }).link
        },
        {
            "title": t("in support market"),
            "linkProps": routes.softwareCatalog({
                "prerogatives": ["isPresentInSupportContract"]
            }).link
        }
    ];

    return (
        <div className={className}>
            <HeroSection className={fr.cx("fr-container")} />

            <div
                style={{
                    "position": "relative",
                    "top": 7
                }}
            >
                <HomepageWaveSvg
                    className={css({
                        "& path": {
                            "fill": fr.colors.decisions.background.alt.blueFrance.default
                        }
                    })}
                />
            </div>
            <section className={cx(classes.softwareSelectionBackground, classes.section)}>
                <div className={fr.cx("fr-container")}>
                    <h2 className={classes.titleSection}>{t("software selection")}</h2>
                    <div className={classes.softwareSelection}>
                        {softwareSelectionList.map(({ title, linkProps }) => (
                            <Tile key={title} title={title} linkProps={linkProps} />
                        ))}
                    </div>
                </div>
            </section>

            <WhatIsTheSillSection
                className={cx(fr.cx("fr-container"), classes.section)}
            />

            <section className={cx(classes.sillNumbersBackground, classes.section)}>
                <div className={cx(fr.cx("fr-container"), classes.sillNumbersContainer)}>
                    <h1 className={cx(classes.whiteText, classes.SillNumberTitle)}>
                        {t("SILL numbers")}
                    </h1>
                    <div className={classes.sillNumberList}>
                        {(
                            [
                                "softwareCount",
                                "registeredUserCount",
                                "agentReferentCount",
                                "organizationCount"
                            ] as const
                        ).map(metricName => (
                            <div key={metricName}>
                                <AnimatedMetric
                                    className={cx(
                                        fr.cx("fr-display--sm"),
                                        classes.whiteText,
                                        classes.numberText
                                    )}
                                    metricValue={stats[metricName]}
                                />
                                <h4 className={classes.whiteText}>{t(metricName)}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className={cx(classes.helpUsBackground, classes.section)}>
                <div className={cx(fr.cx("fr-container"))}>
                    <h2 className={classes.titleSection}>{t("help us")}</h2>
                    <div className={classes.helpUsCards}>
                        {(
                            [
                                "declare referent",
                                "edit software",
                                "add software or service"
                            ] as const
                        ).map(cardName => {
                            const link = (() => {
                                switch (cardName) {
                                    case "add software or service":
                                        return routes.addSoftwareLanding().link;
                                    case "declare referent":
                                    case "edit software":
                                        return routes.softwareCatalog().link;
                                }
                            })();

                            return (
                                <Card
                                    classes={{
                                        "img": css({
                                            "& > img": {
                                                "objectFit": "unset",
                                                "background": "white"
                                            }
                                        })
                                    }}
                                    key={cardName}
                                    title={t(`${cardName} title`)}
                                    desc={t(`${cardName} desc`)}
                                    imageAlt={t("illustration image")}
                                    linkProps={link}
                                    imageUrl={(() => {
                                        switch (cardName) {
                                            case "declare referent":
                                                return humanCooperationSvgUrl;
                                            case "edit software":
                                                return documentSvgUrl;
                                            case "add software or service":
                                                return codingSvgUrl;
                                        }
                                    })()}
                                    footer={
                                        <Button priority="primary" linkProps={link}>
                                            {t(`${cardName} button label`)}
                                        </Button>
                                    }
                                    enlargeLink={false}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnimatedMetric(props: { className?: string; metricValue: number }) {
    const { metricValue, className } = props;

    const { ref, renderedMetricValue } = useMetricCountUpAnimation({
        metricValue
    });

    return (
        <p ref={ref} className={className}>
            {renderedMetricValue}
        </p>
    );
}

const useStyles = tss.withName({ Home }).create({
    "section": {
        ...fr.spacing("padding", {
            "topBottom": "30v"
        }),
        [fr.breakpoints.down("md")]: {
            ...fr.spacing("padding", {
                "topBottom": "10v"
            })
        }
    },
    "titleSection": {
        "marginBottom": fr.spacing("10v"),
        [fr.breakpoints.down("md")]: {
            "marginBottom": fr.spacing("8v")
        }
    },
    "softwareSelectionBackground": {
        "backgroundColor": fr.colors.decisions.background.alt.blueFrance.default
    },
    "softwareSelection": {
        "display": "grid",
        "gridTemplateColumns": "repeat(3, 1fr)",
        "columnGap": fr.spacing("6v"),
        "rowGap": fr.spacing("8v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`
        }
    },
    "sillNumbersBackground": {
        "backgroundColor": fr.colors.decisions.background.actionHigh.blueFrance.default
    },
    "sillNumbersContainer": {
        "textAlign": "center"
    },
    "sillNumberList": {
        "display": "grid",
        "gridTemplateColumns": "repeat(4, 1fr)",
        "columnGap": fr.spacing("6v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`,
            "rowGap": fr.spacing("4v")
        }
    },
    "whiteText": {
        "color": fr.colors.decisions.text.inverted.grey.default
    },
    "SillNumberTitle": {
        "marginBottom": fr.spacing("20v")
    },
    "numberText": {
        "marginBottom": fr.spacing("1v")
    },
    "helpUsBackground": {
        "backgroundColor": fr.colors.decisions.background.default.grey.hover
    },
    "helpUsCards": {
        "display": "grid",
        "gridTemplateColumns": "repeat(3, 1fr)",
        "columnGap": fr.spacing("6v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`,
            "rowGap": fr.spacing("4v")
        }
    }
});

export const { i18n } = declareComponentKeys<
    | {
          K: "title";
          P: { accentColor: string };
          R: JSX.Element;
      }
    | "software selection"
    | "last added"
    | "most used"
    | "essential"
    | "recently updated"
    | "waiting for referent"
    | "in support market"
    | "SILL numbers"
    | "softwareCount"
    | "registeredUserCount"
    | "agentReferentCount"
    | "organizationCount"
    | "help us"
    | "the sill in a few words"
    | {
          K: "the sill in a few words paragraph";
          P: { accentColor: string };
          R: JSX.Element;
      }
    | "illustration image"
    | "declare referent title"
    | "edit software title"
    | "add software or service title"
    | "declare referent desc"
    | "edit software desc"
    | "add software or service desc"
    | "declare referent button label"
    | "edit software button label"
    | "add software or service button label"
>()({ Home });

const { HeroSection } = (() => {
    type Props = {
        className?: string;
    };

    function HeroSection(props: Props) {
        const { className } = props;

        const { cx, classes } = useStyles();

        const { t } = useTranslation({ Home });

        return (
            <section className={cx(classes.root, className)}>
                <div className={classes.titleWrapper}>
                    <h2 className={classes.title}>
                        {t("title", {
                            "accentColor":
                                fr.colors.decisions.text.title.blueFrance.default
                        })}
                    </h2>
                </div>
                <img
                    src={illustration_sill}
                    alt="Illustration du SILL"
                    className={classes.illustration}
                />
            </section>
        );
    }

    const useStyles = tss.withName({ HeroSection }).create({
        "root": {
            "display": "flex",
            [fr.breakpoints.down("md")]: {
                "flexDirection": "column",
                "marginTop": fr.spacing("10v")
            },
            "marginTop": fr.spacing("20v"),
            "marginBottom": fr.spacing("10v")
        },
        "titleWrapper": {
            "flex": 1,
            "display": "flex",
            "alignItems": "center",
            "paddingRight": fr.spacing("10v"),
            [fr.breakpoints.down("md")]: {
                "marginBottom": fr.spacing("15v"),
                "paddingRight": "unset"
            }
        },
        "title": {
            "marginBottom": 0,
            "maxWidth": 700
        },
        "illustration": {
            [fr.breakpoints.down("md")]: {
                "width": "50%",
                "margin": "0 auto"
            }
        }
    });

    return { HeroSection };
})();

const { WhatIsTheSillSection } = (() => {
    type Props = {
        className?: string;
    };

    function WhatIsTheSillSection(props: Props) {
        const { className } = props;

        const [isVisible, setIsVisible] = useState(false);

        const { cx, classes } = useStyles({ isVisible });

        const { t } = useTranslation({ Home });

        return (
            <section className={cx(classes.root, className)}>
                <Waypoint onEnter={() => setIsVisible(true)} />
                <h2>{t("the sill in a few words")}</h2>
                <p className={classes.paragraph}>
                    {t("the sill in a few words paragraph", {
                        "accentColor": fr.colors.decisions.text.title.blueFrance.default
                    })}
                </p>
            </section>
        );
    }

    const useStyles = tss
        .withName({ WhatIsTheSillSection })
        .withParams<{ isVisible: boolean }>()
        .create(({ isVisible }) => ({
            "root": {
                "textAlign": "center",
                "opacity": isVisible ? undefined : 0,
                "animation": !isVisible
                    ? undefined
                    : `${keyframes`
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
        `} 1000ms`
            },
            "paragraph": {
                "maxWidth": 700,
                "margin": "auto"
            }
        }));

    return { WhatIsTheSillSection };
})();
