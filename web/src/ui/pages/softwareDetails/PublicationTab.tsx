import { ScholarlyArticle } from "api/dist/src/types/codemeta";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "react-i18next";

export type Props = {
    referencePublication?: ScholarlyArticle[];
};

export const PublicationTab = (props: Props) => {
    const { referencePublication } = props;

    const { t } = useTranslation();

    return (
        <>
            <h6>{t("softwareDetails.tabReferencePublicationTitle")}</h6>
            <ul>
                {referencePublication?.map(article => {
                    return (
                        <li>
                            <a
                                href={article.identifier?.url?.toString()}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    "marginRight": fr.spacing("2v"),
                                    "color":
                                        fr.colors.decisions.text.actionHigh.blueFrance
                                            .default
                                }}
                            >
                                {article["@id"]}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
