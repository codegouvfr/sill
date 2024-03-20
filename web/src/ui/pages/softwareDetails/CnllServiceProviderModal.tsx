import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";

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

    const { t } = useTranslation({ CnllServiceProviderModal });

    return (
        <modal.Component
            className={className}
            title={t("modal title")}
            buttons={[
                {
                    "doClosesModal": true,
                    "children": t("close")
                }
            ]}
        >
            {t("content description", {
                "cnllWebsiteUrl": "https://cnll.fr/",
                "count": annuaireCnllServiceProviders.length,
                "softwareName": softwareName
            })}
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
