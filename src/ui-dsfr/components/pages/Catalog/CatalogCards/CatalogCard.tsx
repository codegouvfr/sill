import React, { memo } from "react";
import { declareComponentKeys } from "i18nifty";
import { useTranslation, useResolveLocalizedString } from "ui-dsfr/i18n";
import { CompiledData } from "sill-api";
import type { Link } from "type-route";
import { fr, getColors } from "@codegouvfr/react-dsfr";
import { makeStyles } from "tss-react/dsfr";
import { shortEndMonthDate } from "ui-dsfr/useMoment";
import { assert } from "tsafe/assert"
import type { Equals } from "tsafe"
import Tooltip from '@mui/material/Tooltip';

export type Props = {
    className?: string;
    softwareLogoUrl?: string
    softwareName: string;
    isFromFrenchPublicService: boolean;
    isDesktop: boolean;
    isPresentInSupportMarket: boolean
    softwareCurrentVersion: string
    softwareDateCurrentVersion: number
    softwareDescription?: string;
    userCount: number;
    referentCount: number;
    declareUserOrReferent: Link;
    demoLink: Link;
    softwareDetailsLink: Link
}

export const CatalogCard = memo((props: Props) => {
    const {
        className,
        softwareLogoUrl,
        softwareName,
        isPresentInSupportMarket,
        isFromFrenchPublicService,
        isDesktop,
        softwareCurrentVersion,
        softwareDateCurrentVersion,
        softwareDescription,
        userCount,
        referentCount,
        declareUserOrReferent,
        demoLink,
        softwareDetailsLink,
        ...rest
    } = props;

    assert<Equals<typeof rest, {}>>()

    const { t } = useTranslation({ CatalogCard });
    const { resolveLocalizedString } = useResolveLocalizedString();
    const { classes, cx } = useStyles();

    return (
        <div className={cx(fr.cx("fr-card"), classes.container, className)}>
            <div className={cx()}>
                <div className={cx()}>
                    <div className={cx(classes.headerContainer)}>
                        <img
                            className={cx(classes.logo)}
                            src={softwareLogoUrl}
                            alt="Logo du logiciel"
                        />
                        <div className={cx(classes.header)}>
                            <div className={cx(classes.titleContainer)}>
                                <h3 className={cx(classes.title)}>{softwareName}</h3>
                                <div className={cx(classes.titleActionsContainer)}>
                                    {isDesktop &&
                                        <Tooltip title={t("isDesktop")} arrow>
                                            <i className={fr.cx("fr-icon-computer-line")}/>
                                        </Tooltip>
                                    }
                                    {isFromFrenchPublicService &&
                                        <i className={fr.cx("fr-icon-france-line")} />
                                    }
                                    {isPresentInSupportMarket &&
                                        <i className={fr.cx("fr-icon-questionnaire-line")}/>
                                    }
                                </div>
                            </div>
                            <div>
                                <p className={cx(fr.cx("fr-card__detail"))}>
                                    {t("last version")} :
                                    <span
                                        className={cx(
                                            fr.cx(
                                                "fr-badge",
                                                "fr-badge--yellow-tournesol",
                                                "fr-badge--sm",
                                            ),
                                            classes.badgeVersion,
                                        )}
                                    >
                                        {softwareCurrentVersion}
                                    </span>
                                    {t("last version date", {
                                        date: shortEndMonthDate({
                                            time: softwareDateCurrentVersion,
                                        }),
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className={cx(fr.cx("fr-card__desc"), classes.description)}>
                        {softwareDescription
                            ? resolveLocalizedString(softwareDescription)
                            : 'software.function'}
                    </p>
                    <div
                        className={cx(
                            fr.cx("fr-card__detail"),
                            classes.detailsUsersContainer,
                        )}
                    >
                        <i
                            className={cx(
                                fr.cx("fr-icon-user-line"),
                                classes.detailsUsersIcon,
                            )}
                        />
                        <span>
                            {t("userAndReferentCount", {
                                referentCount: referentCount ?? 0,
                                userCount: 0,
                            })}
                        </span>
                        <i className={cx(fr.cx("fr-icon-arrow-right-s-line"))} />
                    </div>
                </div>
                <div className={cx(classes.footer)}>
                    <a
                        className={cx(fr.cx("fr-btn", "fr-btn--secondary"))}
                        {...declareUserOrReferent}
                    >
                        {t("declare oneself referent")}
                    </a>
                    <div className={cx(classes.footerActionsContainer)}>
                        <i className={fr.cx("fr-icon-play-circle-line")} />
                        <i className={fr.cx("fr-icon-arrow-right-line")} />
                    </div>
                </div>
            </div>
        </div>
    );
});

const useStyles = makeStyles({
    "name": { CatalogCard },
})(theme => {
    return {
        "container": {
            "paddingRight": fr.spacing("6v"),
            "paddingLeft": fr.spacing("6v"),
            "paddingTop": fr.spacing("7v"),
            "paddingBottom": fr.spacing("7v"),
            "backgroundColor": getColors(theme.isDark).decisions.background.default.grey
                .default,
        },
        "headerContainer": {
            "display": "flex",
            "alignItems": "center",
            "marginBottom": fr.spacing("4v"),
        },
        "header": {
            "width": "100%",
        },
        "logo": {
            "height": fr.spacing("10v"),
            "width": fr.spacing("10v"),
            "marginRight": fr.spacing("3v"),
        },
        "titleContainer": {
            "display": "flex",
            "justifyContent": "space-between",
        },
        "title": {
            "margin": 0,
            "color": theme.decisions.text.title.grey.default,
        },
        "titleActionsContainer": {
            "display": "flex",
            "alignItems": "center",
            "gap": fr.spacing("2v"),

            "&>i": {
                "color": theme.decisions.text.title.blueFrance.default,
                "&::before": {
                    "--icon-size": fr.spacing("4v"),
                },
            },
        },
        "badgeVersion": {
            "marginLeft": fr.spacing("1v"),
            "marginRight": fr.spacing("1v"),
        },
        "description": {
            "marginTop": 0,
            "marginBottom": fr.spacing("3v"),
            "color": getColors(theme.isDark).decisions.text.default.grey.default,
            "height": fr.spacing('20v'),
            "overflowY": "auto"
        },
        "detailsUsersContainer": {
            "display": "flex",
            "alignItems": "center",
            "marginBottom": fr.spacing("8v"),
        },
        "detailsUsersIcon": {
            "marginRight": fr.spacing("2v"),
        },
        "footer": {
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "space-between",
        },
        "footerActionsContainer": {
            "display": "flex",
            "marginLeft": fr.spacing("4v"),
            "flex": 1,
            "justifyContent": "space-between",
            "color": getColors(theme.isDark).decisions.text.title.blueFrance.default,
        },
    };
});

export const { i18n } = declareComponentKeys<
    | "last version"
    | { K: "last version date"; P: { date: string } }
    | { K: "userAndReferentCount"; P: { userCount: number; referentCount: number } }
    | "declare oneself referent"
    | "isDesktop"
>()({ CatalogCard });