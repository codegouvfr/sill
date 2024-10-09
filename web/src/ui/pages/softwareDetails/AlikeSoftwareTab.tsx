import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import type { State as softwareDetails } from "core/usecases/softwareDetails";
import { SoftwareCatalogCard } from "ui/pages/softwareCatalog/SoftwareCatalogCard";
import type { Link } from "type-route";
import { capitalize } from "tsafe/capitalize";
import { useStyles } from "tss-react";
import { exclude } from "tsafe/exclude";
import { useResolveLocalizedString } from "ui/i18n";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export type Props = {
    className?: string;
    similarSoftwares: softwareDetails.Software["similarSoftwares"];
    getLinks: (params: {
        softwareName: string;
    }) => Record<
        "declarationForm" | "softwareDetails" | "softwareUsersAndReferents",
        Link
    >;
    getAddWikipediaSoftwareToSillLink: (params: { externalId: string }) => Link;
};

export const SimilarSoftwareTab = (props: Props) => {
    const {
        className,
        similarSoftwares,
        getLinks,
        getAddWikipediaSoftwareToSillLink,
        ...rest
    } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { t } = useTranslation({ SimilarSoftwareTab });

    const { css } = useStyles();

    const { resolveLocalizedString } = useResolveLocalizedString();

    const similarSoftwaresNotInSill = similarSoftwares.filter(
        (similarSoftware): similarSoftware is softwareDetails.SimilarSoftwareNotInSill =>
            !similarSoftware.isInSill
    );

    return (
        <section className={className}>
            <p className={fr.cx("fr-text--bold")}>
                {t("similar software in sill")} (
                {similarSoftwares.filter(({ isInSill }) => isInSill).length}) :
            </p>
            {similarSoftwares
                .map(similarSoftware =>
                    similarSoftware.isInSill ? similarSoftware.software : undefined
                )
                .filter(exclude(undefined))
                .map(software => {
                    const {
                        logoUrl,
                        softwareName,
                        latestVersion,
                        softwareDescription,
                        userCount,
                        referentCount,
                        testUrl,
                        prerogatives,
                        userDeclaration
                    } = software;

                    const {
                        declarationForm,
                        softwareDetails,
                        softwareUsersAndReferents
                    } = getLinks({ softwareName });

                    return (
                        <SoftwareCatalogCard
                            className={css({
                                "maxWidth": 600,
                                ...fr.spacing("margin", {
                                    "rightLeft": "auto",
                                    "topBottom": "6v"
                                })
                            })}
                            key={softwareName}
                            logoUrl={logoUrl}
                            softwareName={softwareName}
                            latestVersion={latestVersion}
                            softwareDescription={softwareDescription}
                            prerogatives={prerogatives}
                            testUrl={testUrl}
                            userCount={userCount}
                            referentCount={referentCount}
                            declareFormLink={declarationForm}
                            softwareDetailsLink={softwareDetails}
                            softwareUsersAndReferentsLink={softwareUsersAndReferents}
                            searchHighlight={undefined}
                            userDeclaration={userDeclaration}
                        />
                    );
                })}

            {similarSoftwaresNotInSill.length === 0 ? null : (
                <>
                    <p className={fr.cx("fr-text--bold", "fr-mt-8v")}>
                        {t("similar software not in sill")} (
                        {similarSoftwaresNotInSill.length}) :
                    </p>
                    <ul>
                        {similarSoftwaresNotInSill
                            .sort(
                                (
                                    { isLibreSoftware: isLibreSoftwareA },
                                    { isLibreSoftware: isLibreSoftwareB }
                                ) => {
                                    if (isLibreSoftwareA && !isLibreSoftwareB) {
                                        return -1;
                                    }
                                    if (!isLibreSoftwareA && isLibreSoftwareB) {
                                        return 1;
                                    }
                                    return 0;
                                }
                            )
                            .map(
                                ({ wikidataId, label, description, isLibreSoftware }) => {
                                    return (
                                        <li key={wikidataId}>
                                            <p
                                                className={css({
                                                    "display": "inline-block",
                                                    "marginRight": fr.spacing("4v")
                                                })}
                                            >
                                                <a
                                                    href={`https://www.wikidata.org/wiki/${wikidataId}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {resolveLocalizedString(label)}
                                                </a>
                                                :&nbsp;&nbsp;
                                                {capitalize(
                                                    resolveLocalizedString(description)
                                                )}
                                            </p>
                                            {isLibreSoftware ? (
                                                <Tag
                                                    iconId="ri-check-fill"
                                                    linkProps={getAddWikipediaSoftwareToSillLink(
                                                        {
                                                            externalId: wikidataId
                                                        }
                                                    )}
                                                >
                                                    {t("libre software")}
                                                </Tag>
                                            ) : null}
                                        </li>
                                    );
                                }
                            )}
                    </ul>
                </>
            )}
        </section>
    );
};

export const { i18n } = declareComponentKeys<
    "similar software in sill" | "similar software not in sill" | "libre software"
>()({ SimilarSoftwareTab });
