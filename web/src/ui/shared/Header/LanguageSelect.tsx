import {
    LanguageSelect as LanguageSelectBase,
    addLanguageSelectTranslations
} from "@codegouvfr/react-dsfr/LanguageSelect";
import { useLang } from "ui/i18n";
import i18n from "../../i18n/i18next";

type Props = {
    id?: string;
};

export function LanguageSelect(props: Props) {
    const { id } = props;

    const { setLang } = useLang();

    return (
        <LanguageSelectBase
            id={id}
            supportedLangs={i18n.languages}
            lang={i18n.language}
            setLang={(lang: any) => {
                setLang(lang);
                i18n.changeLanguage(lang);
            }}
            fullNameByLang={{
                en: "English",
                fr: "Français"
            }}
        />
    );
}

i18n.languages.forEach(lang =>
    addLanguageSelectTranslations({
        lang,
        messages: {
            "select language": (() => {
                switch (lang) {
                    case "en":
                        return "Select language";
                    /* spell-checker: disable */
                    case "fr":
                        return "Choisir la langue";
                    /* spell-checker: enable */
                }
            })()
        }
    })
);
