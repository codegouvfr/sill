import { memo } from "react";
import { useLang } from "ui/i18n";
import { useTranslation } from "react-i18next";
import { tss } from "tss-react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { fr } from "@codegouvfr/react-dsfr";
import { getFormattedDate } from "ui/useMoment";
import type { ApiTypes } from "api";

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
    authors: ApiTypes.Author[];
    officialWebsite?: string;
    documentationWebsite?: string;
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
        documentationWebsite,
        sourceCodeRepository,
        onGoBackClick,
        userDeclaration,
        softwareDereferencing,
        ...rest
    } = props;

    assert<Equals<typeof rest, {}>>();

    const { classes, cx } = useStyles();

    const { t } = useTranslation();

    const { lang } = useLang();

    return (
        <div className={cx(classes.root, className)}>
            <div className={classes.leftCol}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href={"#"} onClick={onGoBackClick} className={classes.backButton}>
                    <i className={fr.cx("fr-icon-arrow-left-s-line")} />
                </a>
                <div className={classes.softwareInformation}>
                    {softwareLogoUrl && (
                        <div className={classes.logoWrapper}>
                            <img
                                className={classes.logo}
                                src={softwareLogoUrl}
                                alt={t("headerDetailCard.software logo")}
                            />
                        </div>
                    )}
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
                                    {t("headerDetailCard.you are referent")}
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
                                    {t("headerDetailCard.you are user")}
                                </span>
                            ) : null}
                        </div>
                        {authors.length > 0 && (
                            <div>
                                <span className={classes.authors}>
                                    {t("headerDetailCard.authors")}
                                </span>
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
                                    {t("headerDetailCard.software dereferenced", {
                                        "when": getFormattedDate({
                                            "time": softwareDereferencing.time,
                                            lang,
                                            "doAlwaysShowYear": true
                                        })
                                    })}
                                    {softwareDereferencing.reason === undefined
                                        ? ""
                                        : `, ${softwareDereferencing.reason}`}
                                    {t(
                                        "headerDetailCard.software dereferenced last version",
                                        {
                                            lastRecommendedVersion:
                                                softwareDereferencing.lastRecommendedVersion
                                        }
                                    )}
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
                                "fr-btn--icon-left",
                                "fr-my-2v"
                            )
                        )}
                    >
                        {t("headerDetailCard.website")}
                    </a>
                )}
                {documentationWebsite && (
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={documentationWebsite}
                        className={cx(
                            fr.cx(
                                "fr-icon-global-line",
                                "fr-btn",
                                "fr-btn--secondary",
                                "fr-btn--icon-left",
                                "fr-ml-4v",
                                "fr-my-2v"
                            )
                        )}
                    >
                        {t("headerDetailCard.documentation")}
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
                            "fr-btn--icon-left",
                            "fr-ml-4v",
                            "fr-my-2v"
                        )}
                    >
                        {t("headerDetailCard.repository")}
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
        "minWidth": 65,
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
        "justifyContent": "end",
        "flexWrap": "wrap"
    },
    "dereferencedText": {
        "color": fr.colors.decisions.text.default.error.default
    }
});
