import { Card, CardHeader } from "@mui/material";
import { ApiTypes } from "api";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { MouseEventHandler } from "react";

export type Props = {
    author: ApiTypes.Author;
    handleClose?: MouseEventHandler<HTMLButtonElement>;
};

export function AuthorCard(props: Props) {
    const { author, handleClose } = props;

    const { classes, cx } = useStyles();

    return (
        <Card style={{ "padding": "20px" }}>
            <CardHeader
                title={author.authorName}
                action={
                    handleClose ? (
                        <button
                            onClick={handleClose}
                            className={cx(
                                fr.cx("fr-badge--error", "fr-badge", "fr-mb-1v")
                            )}
                        >
                            Close
                        </button>
                    ) : (
                        ""
                    )
                }
            ></CardHeader>
            <h6>Affiliated Structures</h6>
            {author?.affiliatedStructure?.map(affiliatedStructure => {
                return (
                    <>
                        <a href={affiliatedStructure.url}>{affiliatedStructure.name}</a>
                        <ul>
                            {affiliatedStructure.parentStructure?.map(parentStructure => (
                                <li>
                                    <a href={parentStructure.url}>
                                        {parentStructure.name}
                                    </a>
                                    {parentStructure.parentStructure && (
                                        <ul>
                                            {parentStructure.parentStructure.map(
                                                parent3Structure => (
                                                    <li>
                                                        <a href={parent3Structure.url}>
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
                            <span> </span>
                            <p>HAL</p>
                        </>
                    )}
                    {author.authorUrl.includes("orcid") && (
                        <>
                            <img
                                alt="ORCID logo"
                                src="https://homepage-prod.orcid.org/assets/iD_icon_1-9cfee7d6c7.png"
                                height="20px"
                            ></img>
                            <p>
                                <span> </span> ORCID
                            </p>
                        </>
                    )}
                </a>
            </div>
        </Card>
    );
}

const useStyles = tss.withName({ AuthorCard }).create({
    "externalLinkButtons": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "end",
        "flexWrap": "wrap"
    }
});
