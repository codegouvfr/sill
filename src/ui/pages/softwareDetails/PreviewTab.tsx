import React from "react";
import { declareComponentKeys } from "i18nifty";
import { useLang, useTranslation } from "ui/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { shortEndMonthDate, monthDate } from "ui/useMoment";
import Tooltip from "@mui/material/Tooltip";
import { capitalize } from "tsafe/capitalize";
import {
    CnllServiceProviderModal,
    openCnllServiceProviderModal
} from "./CnllServiceProviderModal";
import { assert, type Equals } from "tsafe/assert";

//TODO: Do not use optional props (?) use ( | undefined ) instead
// so we are sure that we don't forget to provide some props
export type Props = {
    className?: string;
    softwareName: string;
    softwareCurrentVersion?: string;
    softwareDateCurrentVersion?: number;
    softwareDescription: string;
    registerDate?: number;
    minimalVersionRequired?: string;
    license?: string;
    comptoirDuLibreServiceProvidersUrl: string | undefined;
    annuaireCnllServiceProviders: {
        name: string;
        siren: string;
        url: string;
    }[];
    comptoireDuLibreUrl: string | undefined;
    wikiDataUrl: string | undefined;
    hasDesktopApp: boolean | undefined;
    isAvailableAsMobileApp: boolean | undefined;
    isPresentInSupportMarket: boolean | undefined;
    isFromFrenchPublicService: boolean | undefined;
    isRGAACompliant?: boolean | undefined;
};
export const PreviewTab = (props: Props) => {
    const {
        softwareName,
        softwareCurrentVersion,
        softwareDateCurrentVersion,
        softwareDescription,
        registerDate,
        minimalVersionRequired,
        license,
        hasDesktopApp,
        isAvailableAsMobileApp,
        isPresentInSupportMarket,
        isFromFrenchPublicService,
        isRGAACompliant,
        comptoirDuLibreServiceProvidersUrl,
        annuaireCnllServiceProviders,
        comptoireDuLibreUrl,
        wikiDataUrl
    } = props;

    const { classes, cx } = useStyles();

    const { t } = useTranslation({ PreviewTab });
    const { lang } = useLang();

    return (
        <>
            <section className={classes.tabContainer}>
                <p style={{ "gridColumn": "span 2" }}>{softwareDescription}</p>
                <div className="section">
                    <p className={cx(fr.cx("fr-text--bold"), classes.item)}>
                        {t("about")}
                    </p>
                    {softwareDateCurrentVersion && (
                        <p className={cx(fr.cx("fr-text--regular"), classes.item)}>
                            <span className={classes.labelDetail}>
                                {t("last version")}
                            </span>
                            <span
                                className={cx(
                                    fr.cx(
                                        "fr-badge",
                                        "fr-badge--yellow-tournesol",
                                        "fr-badge--sm"
                                    ),
                                    classes.badgeVersion
                                )}
                            >
                                {softwareCurrentVersion}
                            </span>
                            (
                            {capitalize(
                                shortEndMonthDate({
                                    "time": softwareDateCurrentVersion,
                                    lang
                                })
                            )}
                            )
                        </p>
                    )}
                    {registerDate && (
                        <p className={cx(fr.cx("fr-text--regular"), classes.item)}>
                            <span className={classes.labelDetail}>{t("register")}</span>
                            {capitalize(monthDate({ "time": registerDate, lang }))}
                        </p>
                    )}

                    <p className={cx(fr.cx("fr-text--regular"), classes.item)}>
                        <span className={classes.labelDetail}>
                            {t("minimal version")}
                        </span>
                        <span
                            className={cx(
                                fr.cx(
                                    "fr-badge",
                                    "fr-badge--yellow-tournesol",
                                    "fr-badge--sm"
                                ),
                                classes.badgeVersion
                            )}
                        >
                            {minimalVersionRequired}
                        </span>
                    </p>
                    <p className={cx(fr.cx("fr-text--regular"), classes.item)}>
                        <span className={classes.labelDetail}>{t("license")}</span>
                        <span>{license}</span>
                    </p>
                </div>
                <div className={classes.section}>
                    <p className={cx(fr.cx("fr-text--bold"), classes.item)}>
                        {t("prerogatives")}
                    </p>

                    {(
                        [
                            "hasDesktopApp",
                            "isAvailableAsMobileApp",
                            "isPresentInSupportMarket",
                            "isFromFrenchPublicService",
                            "isRGAACompliant"
                        ] as const
                    ).map(prerogativeName => {
                        const value = (() => {
                            switch (prerogativeName) {
                                case "hasDesktopApp":
                                    return hasDesktopApp;
                                case "isAvailableAsMobileApp":
                                    return isAvailableAsMobileApp;
                                case "isFromFrenchPublicService":
                                    return isFromFrenchPublicService;
                                case "isPresentInSupportMarket":
                                    return isPresentInSupportMarket;
                                case "isRGAACompliant":
                                    return isRGAACompliant;
                            }
                            assert<Equals<typeof prerogativeName, never>>(false);
                        })();

                        if (value === undefined) {
                            return null;
                        }

                        const label = t(prerogativeName);

                        return (
                            <div
                                key={label}
                                className={cx(classes.item, classes.prerogativeItem)}
                            >
                                <i
                                    className={cx(
                                        fr.cx(
                                            value
                                                ? "fr-icon-check-line"
                                                : "fr-icon-close-line"
                                        ),
                                        value
                                            ? classes.prerogativeStatusSuccess
                                            : classes.prerogativeStatusError
                                    )}
                                />
                                <p
                                    className={cx(
                                        fr.cx("fr-text--md"),
                                        classes.prerogativeItemDetail
                                    )}
                                >
                                    {label}
                                </p>
                                {prerogativeName === "isPresentInSupportMarket" && (
                                    <Tooltip
                                        title={t("what is the support market", {
                                            "url": "https://code.gouv.fr/fr/utiliser/marches-interministeriels-support-expertise-logiciels-libres/"
                                        })}
                                        arrow
                                    >
                                        <i
                                            className={fr.cx("fr-icon-information-line")}
                                        />
                                    </Tooltip>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className={classes.section}>
                    <p className={cx(fr.cx("fr-text--bold"), classes.item)}>
                        {t("use full links")}
                    </p>
                    {comptoirDuLibreServiceProvidersUrl !== undefined && (
                        <a
                            href={comptoirDuLibreServiceProvidersUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={t("service provider")}
                            className={cx(classes.externalLink, classes.item)}
                        >
                            {t("service provider")}
                        </a>
                    )}
                    {comptoireDuLibreUrl !== undefined && (
                        <a
                            href={comptoireDuLibreUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={t("comptoire du libre sheet")}
                            className={cx(classes.externalLink, classes.item)}
                        >
                            {t("comptoire du libre sheet")}
                        </a>
                    )}
                    {annuaireCnllServiceProviders.length !== 0 && (
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a
                            onClick={() => openCnllServiceProviderModal()}
                            href="#"
                            title={t("CNLL service providers title")}
                            className={cx(classes.externalLink, classes.item)}
                        >
                            {t("CNLL service providers", {
                                "count": annuaireCnllServiceProviders.length
                            })}
                        </a>
                    )}
                    {wikiDataUrl !== undefined && (
                        <a
                            href={wikiDataUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={t("wikiData sheet")}
                            className={cx(classes.externalLink, classes.item)}
                        >
                            {t("wikiData sheet")}
                        </a>
                    )}
                </div>
            </section>
            <CnllServiceProviderModal
                softwareName={softwareName}
                annuaireCnllServiceProviders={annuaireCnllServiceProviders}
            />
        </>
    );
};

const useStyles = tss.withName({ PreviewTab }).create({
    "tabContainer": {
        "display": "grid",
        "gridTemplateColumns": `repeat(2, 1fr)`,
        "columnGap": fr.spacing("4v"),
        "rowGap": fr.spacing("3v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`
        }
    },
    "section": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "flex-start"
    },
    "item": {
        "&:not(:last-of-type)": {
            "marginBottom": fr.spacing("4v")
        }
    },
    "prerogativeItem": {
        "display": "flex",
        "alignItems": "center"
    },
    "prerogativeItemDetail": {
        "color": fr.colors.decisions.text.label.grey.default,
        ...fr.spacing("margin", {
            "left": "3v",
            "right": "1v",
            "bottom": 0
        })
    },
    "prerogativeStatusSuccess": {
        "color": fr.colors.decisions.text.default.success.default
    },
    "prerogativeStatusError": {
        "color": fr.colors.decisions.text.default.error.default
    },
    "labelDetail": {
        "color": fr.colors.decisions.text.mention.grey.default
    },
    "badgeVersion": {
        ...fr.spacing("margin", { rightLeft: "2v" })
    },
    "externalLink": {
        "color": fr.colors.decisions.text.actionHigh.blueFrance.default
    }
});

export const { i18n } = declareComponentKeys<
    | "about"
    | "use full links"
    | "prerogatives"
    | "last version"
    | "register"
    | "minimal version"
    | "license"
    | "hasDesktopApp"
    | "isAvailableAsMobileApp"
    | "isPresentInSupportMarket"
    | "isFromFrenchPublicService"
    | "isRGAACompliant"
    | "service provider"
    | "comptoire du libre sheet"
    | "CNLL service providers title"
    | { K: "CNLL service providers"; P: { count: number } }
    | "wikiData sheet"
    | { K: "what is the support market"; P: { url: string }; R: JSX.Element }
>()({ PreviewTab });
