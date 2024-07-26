import { memo, forwardRef } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { useTranslation } from "ui/i18n";
import { Footer as DsfrFooter } from "@codegouvfr/react-dsfr/Footer";
import { routes } from "ui/routes";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { declareComponentKeys } from "i18nifty";
import { apiUrl } from "urls";

export type Props = {
    className?: string;
    apiVersion: string;
    webVersion: string;
};

export const Footer = memo(
    forwardRef<HTMLDivElement, Props>((props, ref) => {
        const { className, apiVersion, webVersion, ...rest } = props;

        assert<Equals<typeof rest, {}>>();

        const { t } = useTranslation({ Footer });

        return (
            <>
                <DsfrFooter
                    ref={ref}
                    className={className}
                    accessibility="fully compliant"
                    termsLinkProps={routes.terms().link}
                    bottomItems={[
                        {
                            "text": `sill-api: v${apiVersion}`,
                            "linkProps": {
                                "href": `https://github.com/codegouvfr/sill/tree/v${apiVersion}`
                            }
                        },
                        {
                            "text": `sill-web: v${webVersion}`,
                            "linkProps": {
                                "href": `https://github.com/codegouvfr/sill/tree/v${webVersion}`
                            }
                        },
                        {
                            "text": t("contribute"),
                            "linkProps": {
                                "href": "https://github.com/codegouvfr/sill-web/issues/new"
                            }
                        },
                        {
                            "text": "XML feed",
                            "linkProps": {
                                "href": `https://code.gouv.fr/data/latest-sill.xml`
                            }
                        },
                        {
                            "text": "json",
                            "linkProps": {
                                "href": `${apiUrl}/sill.json`
                            }
                        },
                        {
                            "text": "pdf",
                            "linkProps": {
                                "href": "https://code.gouv.fr/data/sill.pdf"
                            }
                        },
                        {
                            "text": "tsv",
                            "linkProps": {
                                "href": "https://code.gouv.fr/data/sill.tsv"
                            }
                        },
                        headerFooterDisplayItem
                    ]}
                />
            </>
        );
    })
);

export const { i18n } = declareComponentKeys<"contribute">()({ Footer });
