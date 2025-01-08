import { useState } from "react";
import { tss } from "tss-react";
import { keyframes } from "tss-react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
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
import { Trans, useTranslation } from "react-i18next";
import config from "../../../ui/config-ui.json";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Home(props: Props) {
    const { className, route, ...rest } = props;

    assert<Equals<typeof rest, {}>>();

    const { cx, classes, css } = useStyles();
    const { t } = useTranslation();

    const stats = useCoreState("generalStats", "main");

    type availableStat =
        | "softwareCount"
        | "registeredUserCount"
        | "agentReferentCount"
        | "organizationCount";
    const statsCases = config.home.statistics.catgegories as Array<availableStat>;

    type availableUseCase = "declareReferent" | "editSoftware" | "addSoftwareOrService";
    const useCases = config.home.usecases.catgegories as Array<availableUseCase>;

    const softwareSelectionList = [
        {
            "title": t("home.lastAdded"),
            "linkProps": routes.softwareCatalog({
                "sort": "added_time"
            }).link
        },
        {
            "title": t("home.mostUsed"),
            "linkProps": routes.softwareCatalog({
                "sort": "user_count"
            }).link
        },
        {
            "title": t("home.essential"),
            "linkProps": routes.softwareCatalog({
                "prerogatives": ["isInstallableOnUserComputer"]
            }).link
        },
        {
            "title": t("home.recentlyUpdated"),
            "linkProps": routes.softwareCatalog({
                "sort": "latest_version_publication_date"
            }).link
        },
        {
            "title": t("home.waitingForReferent"),
            "linkProps": routes.softwareCatalog({
                "sort": "referent_count_ASC"
            }).link
        },
        {
            "title": t("home.inSupportMarket"),
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

            {config?.home?.softwareSelection?.enabled && (
                <section
                    className={cx(classes.softwareSelectionBackground, classes.section)}
                >
                    <div className={fr.cx("fr-container")}>
                        <h2 className={classes.titleSection}>
                            {t("home.softwareSelection")}
                        </h2>
                        <div className={classes.softwareSelection}>
                            {softwareSelectionList.map(({ title, linkProps }) => (
                                <Tile key={title} title={title} linkProps={linkProps} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <WhatIsTheSillSection
                className={cx(fr.cx("fr-container"), classes.section)}
            />

            <section className={cx(classes.sillNumbersBackground, classes.section)}>
                <div className={cx(fr.cx("fr-container"), classes.sillNumbersContainer)}>
                    <h1 className={cx(classes.whiteText, classes.SillNumberTitle)}>
                        {t("home.SILLNumbers")}
                    </h1>
                    <div className={classes.sillNumberList}>
                        {statsCases.map((metricName: availableStat) => (
                            <div key={metricName}>
                                <AnimatedMetric
                                    className={cx(
                                        fr.cx("fr-display--sm"),
                                        classes.whiteText,
                                        classes.numberText
                                    )}
                                    metricValue={stats[metricName]}
                                />
                                <h4 className={classes.whiteText}>
                                    {t(`home.${metricName}`)}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className={cx(classes.helpUsBackground, classes.section)}>
                <div className={cx(fr.cx("fr-container"))}>
                    <h2 className={classes.titleSection}>{t("home.helpUs")}</h2>
                    <div className={classes.helpUsCards}>
                        {useCases.map((cardName: availableUseCase) => {
                            const link = (() => {
                                switch (cardName) {
                                    case "addSoftwareOrService":
                                        return routes.addSoftwareLanding().link;
                                    case "declareReferent":
                                    case "editSoftware":
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
                                    title={t(`home.${cardName}Title`)}
                                    desc={t(`home.${cardName}Desc`)}
                                    imageAlt={t("home.illustrationImage")}
                                    linkProps={link}
                                    imageUrl={(() => {
                                        switch (cardName) {
                                            case "declareReferent":
                                                return humanCooperationSvgUrl;
                                            case "editSoftware":
                                                return documentSvgUrl;
                                            case "addSoftwareOrService":
                                                return codingSvgUrl;
                                        }
                                    })()}
                                    footer={
                                        <Button priority="primary" linkProps={link}>
                                            {t(`home.${cardName}ButtonLabel`)}
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

const { HeroSection } = (() => {
    type Props = {
        className?: string;
    };

    function HeroSection(props: Props) {
        const { className } = props;

        const { cx, classes } = useStyles();

        const { t } = useTranslation();

        return (
            <section className={cx(classes.root, className)}>
                <div className={classes.titleWrapper}>
                    <h2 className={classes.title}>
                        <span
                            style={{
                                "color": fr.colors.decisions.text.title.blueFrance.default
                            }}
                        >
                            {t("home.title")}
                        </span>{" "}
                        {t("home.subTitle")}
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

        const { t } = useTranslation();

        return (
            <section className={cx(classes.root, className)}>
                <Waypoint onEnter={() => setIsVisible(true)} />
                <h2>{t("home.theSillInAFewWords")}</h2>
                <p className={classes.paragraph}>
                    <Trans
                        i18nKey={"home.theSillInAFewWordsParagraph"}
                        components={{
                            space: <span> </span>,
                            a1: (
                                /* eslint-disable-next-line jsx-a11y/anchor-has-content */
                                <a
                                    href="https://fr.wikipedia.org/wiki/Logiciel_libre"
                                    style={{
                                        "color":
                                            fr.colors.decisions.text.title.blueFrance
                                                .default
                                    }}
                                />
                            ),
                            a2: (
                                /* eslint-disable-next-line jsx-a11y/anchor-has-content */
                                <a
                                    href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000033203039"
                                    style={{
                                        "color":
                                            fr.colors.decisions.text.title.blueFrance
                                                .default
                                    }}
                                />
                            ),
                            a3: (
                                /* eslint-disable-next-line jsx-a11y/anchor-has-content */
                                <a
                                    href="https://code.gouv.fr/sill/readme"
                                    style={{
                                        "color":
                                            fr.colors.decisions.text.title.blueFrance
                                                .default
                                    }}
                                />
                            ),
                            a4: (
                                /* eslint-disable-next-line jsx-a11y/anchor-has-content */
                                <a
                                    href="https://code.gouv.fr/fr/doc/licences-libres-dinum"
                                    style={{
                                        "color":
                                            fr.colors.decisions.text.title.blueFrance
                                                .default
                                    }}
                                />
                            )
                        }}
                    ></Trans>
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
