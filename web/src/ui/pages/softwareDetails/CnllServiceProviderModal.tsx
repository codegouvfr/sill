import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { declareComponentKeys } from "i18nifty";
import { Trans, useTranslation } from "react-i18next";

const modal = createModal({
    "id": "cnll-service-provider",
    "isOpenedByDefault": false
});

export const { open: openCnllServiceProviderModal } = modal;

type Props = {
    className?: string;
    softwareName: string;
    annuaireCnllServiceProviders:
        | {
              name: string;
              siren: string;
              url: string;
          }[];
};

export function CnllServiceProviderModal(props: Props) {
    const { className, annuaireCnllServiceProviders, softwareName } = props;

    const { t } = useTranslation();

    return (
        <modal.Component
            className={className}
            title={t("CnllServiceProviderModal.modal title")}
            buttons={[
                {
                    "doClosesModal": true,
                    "children": t("CnllServiceProviderModal.close")
                }
            ]}
        >
            <Trans
                i18nKey="CnllServiceProviderModal.content description"
                components={{
                    a: <a href="https://cnll.fr/" target="_blank" rel="noreferrer" />
                }}
                values={{
                    "count": annuaireCnllServiceProviders.length,
                    "softwareName": softwareName
                }}
            ></Trans>
            <ul>
                {annuaireCnllServiceProviders.map(({ name, siren, url }) => (
                    <li key={url}>
                        <a href={url} target="_blank" rel="noreferrer">
                            {name}, siren: {siren}
                        </a>
                    </li>
                ))}
            </ul>
        </modal.Component>
    );
}

export const { i18n } = declareComponentKeys<
    | "close"
    | "modal title"
    | {
          K: "content description";
          P: { cnllWebsiteUrl: "https://cnll.fr/"; softwareName: string; count: number };
          R: JSX.Element;
      }
>()({ CnllServiceProviderModal });
