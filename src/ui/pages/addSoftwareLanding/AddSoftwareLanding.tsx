import { tss } from "tss-react/dsfr";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import type { PageRoute } from "./route";
import { routes } from "ui/routes";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import illustration_sill from "ui/assets/illustration_sill.svg";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function AddSoftwareLanding(props: Props) {
    const { className, route, ...rest } = props;

    assert<Equals<typeof rest, {}>>();

    const { cx, classes } = useStyles();
    const { t } = useTranslation({ AddSoftwareLanding });
    const { t: tCommon } = useTranslation({ "App": undefined });

    const whoCanAddAccordionList = [
        {
            "label": t("discover as agent label"),
            "description": t("discover as agent description")
        },
        {
            "label": t("discover as DSI label"),
            "description": t("discover as DSI description")
        },
        {
            "label": t("contribute as agent label"),
            "description": t("contribute as agent description")
        },
        {
            "label": t("contribute as DSI label"),
            "description": t("contribute as DSI description")
        }
    ];

    return (
        <div className={className}>
            <div className={classes.section}>
                <div className={cx(fr.cx("fr-container"), classes.titleContainer)}>
                    <div>
                        <h2 className={classes.title}>{t("title")}</h2>
                        <p className={fr.cx("fr-text--lg")}>{t("subtitle")}</p>
                    </div>
                    <img
                        src={illustration_sill}
                        alt="Illustration du SILL"
                        className={classes.clipart}
                    />
                </div>
            </div>
            <section className={cx(classes.whoCanAddBackground, classes.section)}>
                <div className={fr.cx("fr-container")}>
                    <div
                        className={cx(
                            classes.titleSection,
                            classes.whoCanAddHeaderContainer
                        )}
                    >
                        <h2 className={classes.whoCanAddTitle}>
                            {t("who can add software")}
                        </h2>
                        <div className={classes.whoCanAddButtonContainer}>
                            <a
                                {...routes.softwareCreationForm().link}
                                className={fr.cx("fr-btn")}
                            >
                                {tCommon("add software")}
                            </a>
                            <a
                                {...routes.instanceCreationForm().link}
                                className={fr.cx("fr-btn", "fr-btn--secondary")}
                            >
                                {tCommon("add instance")}
                            </a>
                        </div>
                    </div>

                    {whoCanAddAccordionList.map(accordion => (
                        <Accordion key={accordion.label} label={accordion.label}>
                            <p className={classes.accordionDescription}>
                                {accordion.description}
                            </p>
                        </Accordion>
                    ))}
                </div>
            </section>
        </div>
    );
}

const useStyles = tss.withName({ AddSoftwareLanding }).createUseStyles({
    "section": {
        ...fr.spacing("padding", {
            "topBottom": "30v"
        }),
        [fr.breakpoints.down("md")]: {
            ...fr.spacing("padding", {
                "topBottom": "10v"
            })
        }
    },
    "titleSection": {
        "marginBottom": fr.spacing("10v"),
        [fr.breakpoints.down("md")]: {
            "marginBottom": fr.spacing("8v")
        }
    },
    "titleContainer": {
        "marginBottom": fr.spacing("10v"),
        "display": "flex",
        [fr.breakpoints.down("md")]: {
            "flexDirection": "column"
        }
    },
    "title": {
        "marginRight": fr.spacing("30v"),
        "&>span": {
            "color": fr.colors.decisions.text.title.blueFrance.default
        },
        [fr.breakpoints.down("md")]: {
            ...fr.spacing("margin", {
                "right": 0,
                "bottom": "8v"
            })
        }
    },
    "clipart": {
        [fr.breakpoints.down("md")]: {
            "width": "50%",
            "margin": "0 auto"
        }
    },
    "whoCanAddBackground": {
        "backgroundColor": fr.colors.decisions.background.alt.blueFrance.default
    },
    "whoCanAddHeaderContainer": {
        "display": "flex",
        "alignItems": "center",
        "gap": fr.spacing("2v"),
        [fr.breakpoints.down("md")]: {
            "gap": fr.spacing("8v"),
            "flexDirection": "column"
        }
    },
    "whoCanAddTitle": {
        "marginBottom": 0
    },
    "whoCanAddButtonContainer": {
        "display": "flex",
        "gap": fr.spacing("2v"),
        "whiteSpace": "nowrap",
        [fr.breakpoints.down("md")]: {
            "whiteSpace": "normal"
        }
    },
    "accordionDescription": {
        "marginBottom": 0
    }
});

export const { i18n } = declareComponentKeys<
    | {
          K: "title";
          R: JSX.Element;
      }
    | "subtitle"
    | "who can add software"
    | "discover as agent label"
    | { K: "discover as agent description"; R: JSX.Element }
    | "discover as DSI label"
    | { K: "discover as DSI description"; R: JSX.Element }
    | "contribute as agent label"
    | { K: "contribute as agent description"; R: JSX.Element }
    | "contribute as DSI label"
    | { K: "contribute as DSI description"; R: JSX.Element }
>()({ AddSoftwareLanding });
