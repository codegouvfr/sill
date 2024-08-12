import {
    LanguageSelect as LanguageSelectBase,
    addLanguageSelectTranslations
} from "@codegouvfr/react-dsfr/LanguageSelect";
import { useLang, languages } from "ui/i18n";

type Props = {
    id?: string;
};

export function LanguageSelect(props: Props) {
    const { id } = props;

    const { lang, setLang } = useLang();

    return (
        <LanguageSelectBase
            id={id}
            supportedLangs={languages}
            lang={lang}
            setLang={setLang}
            fullNameByLang={{
                en: "English",
                fr: "Français"
            }}
        />
    );
}

languages.forEach(lang =>
    addLanguageSelectTranslations({
        lang,
        "messages": {
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
