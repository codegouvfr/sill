import { memo } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { type Language, languages } from "ui/i18n";

type Props = {
    lang: Language;
    setLang: (lang: Language) => void;
};

const fullNameByLang: Record<Language, string> = {
    "fr": "Français",
    "en": "English"
};

/**
 * The button controlling the component must specify 2 attributes
 * - "aria-controls": "translate-select",
 * - "aria-expanded": false,
 */
export const LanguageSelector = memo((props: Props) => {
    const { lang, setLang } = props;

    const { cx, classes } = useStyles();

    return (
        <>
            <div className={classes.root}>
                {" "}
                <span className={classes.langShort}>{lang}</span>
                <span className={fr.cx("fr-hidden-lg")}>
                    {" "}
                    -{fullNameByLang[lang]}
                </span>{" "}
            </div>
            <div
                className={cx(fr.cx("fr-collapse", "fr-menu"), classes.menuLanguage)}
                id="translate-select"
            >
                <ul className={fr.cx("fr-menu__list")}>
                    {languages.map(lang_i => (
                        <li key={lang_i}>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a
                                className={fr.cx(
                                    "fr-translate__language",
                                    "fr-nav__link"
                                )}
                                href="#"
                                aria-current={lang_i === lang ? "true" : undefined}
                                onClick={e => {
                                    e.preventDefault();
                                    setLang(lang_i);
                                }}
                            >
                                <span className={classes.langShort}>{lang_i}</span>
                                &nbsp;-&nbsp;{fullNameByLang[lang_i]}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
});

const useStyles = tss.withName({ LanguageSelector }).create({
    "root": {
        "display": "inline-flex"
    },
    "menuLanguage": {
        "right": 0
    },
    "langShort": {
        "textTransform": "uppercase"
    }
});
