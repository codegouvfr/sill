import { Card, CardHeader } from "@mui/material";
import { ApiTypes } from "api";
import { tss } from "tss-react";
import { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import Button from "@codegouvfr/react-dsfr/Button";

export type Props = {
    author: ApiTypes.SILL.Person;
    handleClose?: MouseEventHandler<HTMLButtonElement>;
};

export function AuthorCard(props: Props) {
    const { author, handleClose } = props;

    const { classes } = useStyles();

    const { t } = useTranslation();

    return (
        <Card style={{ "padding": "20px" }}>
            <CardHeader
                title={author.name}
                action={
                    handleClose ? (
                        <Button priority="secondary" onClick={handleClose}>
                            {t("app.close")}
                        </Button>
                    ) : (
                        ""
                    )
                }
            ></CardHeader>
            <h6>{t("authorCard.affiliatedStructure")}</h6>
            {author?.affiliation?.map(affiliatedOrganization => {
                return (
                    <>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={affiliatedOrganization.url}
                        >
                            {affiliatedOrganization.name}
                        </a>
                        <ul>
                            {affiliatedOrganization.parentOrganization?.map(
                                parentOrganization => (
                                    <li>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={parentOrganization.url}
                                        >
                                            {parentOrganization.name}
                                        </a>
                                        {parentOrganization.parentOrganization && (
                                            <ul>
                                                {parentOrganization.parentOrganization.map(
                                                    parentOrganization3 => (
                                                        <li>
                                                            <a
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                href={
                                                                    parentOrganization3.url
                                                                }
                                                            >
                                                                {parentOrganization3.name}
                                                            </a>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                )
                            )}
                        </ul>
                    </>
                );
            })}
            <div className={classes.externalLinkButtons}>
                <Button
                    linkProps={{
                        target: "_blank",
                        rel: "noreferrer",
                        href: author.url
                    }}
                >
                    {author?.url?.includes("hal.science") && (
                        <>
                            <img
                                alt="HAL logo"
                                src="https://hal.science/assets/favicon/apple-touch-icon.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>HAL</p>
                        </>
                    )}
                    {author?.url?.includes("orcid") && (
                        <>
                            <img
                                alt="ORCID logo"
                                src="https://homepage-prod.orcid.org/assets/iD_icon_1-9cfee7d6c7.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>ORCID</p>
                        </>
                    )}
                    {author?.url?.includes("wikidata") && (
                        <>
                            <img
                                alt="Wikidata logo"
                                src="https://www.wikidata.org/static/apple-touch/wikidata.png"
                                height="20px"
                            ></img>
                            <p className={classes.linkContent}>Wikidata</p>
                        </>
                    )}
                </Button>
            </div>
        </Card>
    );
}

const useStyles = tss.withName({ AuthorCard }).create({
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
