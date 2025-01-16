import { Card, CardHeader } from "@mui/material";
import { ApiTypes } from "api";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";

export type Props = {
    author: ApiTypes.Author;
    handleClose?: MouseEventHandler<HTMLButtonElement>;
};

export function AuthorCard(props: Props) {
    const { author, handleClose } = props;

    const { classes, cx } = useStyles();

    const { t } = useTranslation();

    return (
        <Card style={{ "padding": "20px" }}>
            <CardHeader
                title={author.authorName}
                action={
                    handleClose ? (
                        <button
                            onClick={handleClose}
                            className={cx(
                                fr.cx("fr-badge--error", "fr-badge", "fr-mb-1v"),
                                classes.actionClose
                            )}
                        >
                            {t("app.close")}
                        </button>
                    ) : (
                        ""
                    )
                }
            ></CardHeader>
            <h6>{t("authorCard.affiliatedStructure")}</h6>
            {author?.affiliatedStructure?.map(affiliatedStructure => {
                return (
                    <>
                        <a target="_blank" href={affiliatedStructure.url}>
                            {affiliatedStructure.name}
                        </a>
                        <ul>
                            {affiliatedStructure.parentStructure?.map(parentStructure => (
                                <li>
                                    <a target="_blank" href={parentStructure.url}>
                                        {parentStructure.name}
                                    </a>
                                    {parentStructure.parentStructure && (
                                        <ul>
                                            {parentStructure.parentStructure.map(
                                                parent3Structure => (
                                                    <li>
                                                        <a
                                                            target="_blank"
                                                            href={parent3Structure.url}
                                                        >
                                                            {parent3Structure.name}
                                                        </a>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                );
            })}
            <div className={classes.externalLinkButtons}>
                <a
                    target="_blank"
                    rel="noreferrer"
                    href={author.authorUrl}
                    className={cx(
                        fr.cx(
                            "fr-btn",
                            "fr-btn--secondary",
                            "fr-btn--icon-left",
                            "fr-my-2v"
                        )
                    )}
                >
                    {author.authorUrl.includes("hal.science") && (
                        <>
                            <img
                                alt="HAL logo"
                                src="https://hal.science/assets/favicon/apple-touch-icon.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>HAL</p>
                        </>
                    )}
                    {author.authorUrl.includes("orcid") && (
                        <>
                            <img
                                alt="ORCID logo"
                                src="https://homepage-prod.orcid.org/assets/iD_icon_1-9cfee7d6c7.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>ORCID</p>
                        </>
                    )}
                    {author.authorUrl.includes("wikidata") && (
                        <>
                            <img
                                alt="Wikidata logo"
                                src="https://www.wikidata.org/static/apple-touch/wikidata.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>Wikidata</p>
                        </>
                    )}
                </a>
            </div>
        </Card>
    );
}

const useStyles = tss.withName({ AuthorCard }).create({
    "actionClose": {
        "marginLeft": "40px",
        "marginTop": "10px"
    },
    "linkContent": {
        "marginLeft": "7px"
    },
    "externalLinkButtons": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "end",
        "flexWrap": "wrap"
    }
});
