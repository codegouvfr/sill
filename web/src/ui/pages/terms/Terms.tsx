import { useEffect } from "react";
import { useCoreState, useCore } from "core";
import { useLang } from "ui/i18n";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import type { PageRoute } from "./route";
import { LoadingFallback } from "ui/shared/LoadingFallback";
import Markdown from "react-markdown";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Terms(props: Props) {
    const { className } = props;

    const { classes, cx } = useStyles();

    const { termsOfServices } = useCore().functions;

    const { lang } = useLang();

    useEffect(() => {
        termsOfServices.initialize({ lang });
    }, [lang]);

    const { isReady, markdown } = useCoreState("termsOfServices", "main");

    if (!isReady) {
        return <LoadingFallback />;
    }

    return (
        <div className={cx(classes.root, className)}>
            <Markdown className={classes.markdown}>{markdown}</Markdown>
        </div>
    );
}

export const useStyles = tss.withName({ Terms }).create({
    root: {
        display: "flex",
        justifyContent: "center"
    },
    markdown: {
        borderRadius: fr.spacing("2v"),
        maxWidth: 900,
        padding: fr.spacing("4v"),
        "&:hover": {
            boxShadow: "0px 6px 10px 0px rgba(0,0,0,0.14)"
        },
        marginBottom: fr.spacing("2v")
    }
});
