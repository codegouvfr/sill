import Markdown from "react-markdown";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import type { PageRoute } from "./route";
import { useTranslation } from "react-i18next";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Readme(props: Props) {
    const { className } = props;

    const { classes, cx } = useStyles();

    const { t } = useTranslation();

    return (
        <div className={cx(classes.root, className)}>
            <Markdown className={classes.markdown}>{t("about.text")}</Markdown>
        </div>
    );
}

const useStyles = tss.withName({ Readme }).create({
    root: {
        display: "flex",
        justifyContent: "center"
    },
    markdown: {
        borderRadius: fr.spacing("2v"),
        maxWidth: 900,
        padding: fr.spacing("4v"),
        ...fr.spacing("margin", {
            topBottom: "6v"
        })
    }
});
