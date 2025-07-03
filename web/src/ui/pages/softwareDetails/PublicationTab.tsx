import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "react-i18next";
import { ApiTypes } from "api";

export type Props = {
    referencePublications?: ApiTypes.Catalogi.ScholarlyArticle[];
};

export const PublicationTab = (props: Props) => {
    const { referencePublications } = props;

    const { t } = useTranslation();

    return (
        <>
            <h6>{t("softwareDetails.tabReferencePublicationTitle")}</h6>
            <ul>
                {referencePublications?.map(article => {
                    return (
                        <li>
                            <a
                                href={article.identifier?.url?.toString()}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    marginRight: fr.spacing("2v"),
                                    color: fr.colors.decisions.text.actionHigh.blueFrance
                                        .default
                                }}
                            >
                                {article.headline ?? article["@id"]}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
