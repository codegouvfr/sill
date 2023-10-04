import { memo } from "react";
import { declareComponentKeys } from "i18nifty";
import { useTranslation, useLang } from "ui/i18n";
import { tss } from "tss-react/dsfr";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { fr } from "@codegouvfr/react-dsfr";
import { getFormattedDate } from "ui/useMoment";

export type Props = {
    className?: string;
    softwareLogoUrl?: string;
    softwareName: string;
    softwareDereferencing:
        | {
              reason?: string;
              time: number;
              lastRecommendedVersion?: string;
          }
        | undefined;
    authors: {
        authorName: string;
        authorUrl: string;
    }[];
    officialWebsite?: string;
    sourceCodeRepository?: string;
    onGoBackClick: () => void;
    userDeclaration:
        | {
              isUser: boolean;
              isReferent: boolean;
          }
        | undefined;
};

export const HeaderDetailCard = memo((props: Props) => {
    const {
        className,
        softwareLogoUrl,
        softwareName,
        authors,
        officialWebsite,
        sourceCodeRepository,
        onGoBackClick,
        userDeclaration,
        softwareDereferencing,
        ...rest
    } = props;

    assert<Equals<typeof rest, {}>>();

    const { classes, cx } = useStyles();

    const { t } = useTranslation({ HeaderDetailCard });

    const { lang } = useLang();

    return (
        <div className={cx(classes.root, className)}>
            <div className={classes.leftCol}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href={"#"} onClick={onGoBackClick} className={classes.backButton}>
                    <i className={fr.cx("fr-icon-arrow-left-s-line")} />
                </a>
                <div className={classes.softwareInformation}>
                    <div className={classes.logoWrapper}>
                        <img
                            className={classes.logo}
                            src={softwareLogoUrl}
                            alt={t("software logo")}
                        />
                    </div>
                    <div className={classes.mainInfo}>
                        <div className={classes.titleAndTagWrapper}>
                            <h4 className={classes.softwareName}>{softwareName}</h4>
                            &nbsp; &nbsp;
                            {userDeclaration?.isReferent ? (
                                <span
                                    className={fr.cx(
                                        "fr-badge--no-icon",
                                        "fr-badge--blue-cumulus",
                                        "fr-badge",
                                        "fr-badge--sm",
                                        "fr-mb-1v"
                                    )}
                                >
                                    {t("you are referent")}
                                </span>
                            ) : userDeclaration?.isUser ? (
                                <span
                                    className={fr.cx(
                                        "fr-badge--no-icon",
                                        "fr-badge--green-archipel",
                                        "fr-badge",
                                        "fr-badge--sm",
                                        "fr-mb-1v"
                                    )}
                                >
                                    {t("you are user")}
                                </span>
                            ) : null}
                        </div>
                        {authors.length > 0 && (
                            <div>
                                <span className={classes.authors}>{t("authors")}</span>
                                <span>
                                    {authors.map(author => (
                                        <a
                                            href={author.authorUrl}
                                            className={classes.authorLink}
                                            key={author.authorName}
                                        >
                                            {author.authorName}
                                        </a>
                                    ))}
                                </span>
                            </div>
                        )}
                        {softwareDereferencing !== undefined && (
                            <>
                                &nbsp; &nbsp;
                                <p className={classes.dereferencedText}>
                                    {t("software dereferenced", {
                                        "lastRecommendedVersion":
                                            softwareDereferencing.lastRecommendedVersion,
                                        "reason": softwareDereferencing.reason,
                                        "when": getFormattedDate({
                                            "time": softwareDereferencing.time,
                                            lang,
                                            "doAlwaysShowYear": true
                                        })
                                    })}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={classes.externalLinkButtons}>
                {officialWebsite && (
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={officialWebsite}
                        className={cx(
                            fr.cx(
                                "fr-icon-global-line",
                                "fr-btn",
                                "fr-btn--secondary",
                                "fr-btn--icon-left"
                            ),
                            classes.officialWebsiteButton
                        )}
                    >
                        {t("website")}
                    </a>
                )}
                {sourceCodeRepository && (
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={sourceCodeRepository}
                        className={fr.cx(
                            "fr-icon-code-s-slash-line",
                            "fr-btn",
                            "fr-btn--secondary",
                            "fr-btn--icon-left"
                        )}
                    >
                        {t("repository")}
                    </a>
                )}
            </div>
        </div>
    );
});

const useStyles = tss.withName({ HeaderDetailCard }).create({
    "root": {
        "display": "grid",
        "gridTemplateColumns": `repeat(2, 1fr)`,
        "columnGap": fr.spacing("6v"),
        "marginBottom": fr.spacing("6v"),
        [fr.breakpoints.down("md")]: {
            "gridTemplateColumns": `repeat(1, 1fr)`,
            "gridRowGap": fr.spacing("6v")
        }
    },
    "leftCol": {
        "display": "flex",
        "alignItems": "center"
    },
    "backButton": {
        "background": "none",
        "marginRight": fr.spacing("4v"),

        "&>i": {
            "&::before": {
                "--icon-size": fr.spacing("8v")
            }
        }
    },
    "softwareInformation": {
        "display": "flex",
        "flex": "1"
    },
    "mainInfo": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "flex-start",
        "justifyContent": "center"
    },
    "titleAndTagWrapper": {
        "display": "flex",
        "alignItems": "center"
    },
    "logoWrapper": {
        "min-width": 65,
        "width": fr.spacing("14v"),
        "height": fr.spacing("14v"),
        "marginRight": fr.spacing("3v"),
        "overflow": "hidden"
    },
    "logo": {
        "height": "100%"
    },
    "softwareName": {
        "marginBottom": fr.spacing("1v")
    },
    "authors": {
        "color": fr.colors.decisions.text.mention.grey.default
    },
    "authorLink": {
        "marginRight": fr.spacing("2v"),
        "color": fr.colors.decisions.text.actionHigh.blueFrance.default
    },
    "externalLinkButtons": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "end"
    },
    "officialWebsiteButton": {
        "marginRight": fr.spacing("4v")
    },
    "dereferencedText": {
        "color": fr.colors.decisions.text.default.error.default
    }
});

export const { i18n } = declareComponentKeys<
    | "authors"
    | "website"
    | "repository"
    | "software logo"
    | "you are user"
    | "you are referent"
    | {
          K: "software dereferenced";
          P: { lastRecommendedVersion?: string; reason?: string; when: string };
      }
>()({
    HeaderDetailCard
});
