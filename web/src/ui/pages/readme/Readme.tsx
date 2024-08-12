import { useEffect } from "react";
import { Markdown } from "keycloakify/tools/Markdown";
import { useCoreState, useCore } from "core";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import type { PageRoute } from "./route";
import { useLang } from "ui/i18n";
import { LoadingFallback } from "ui/shared/LoadingFallback";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Readme(props: Props) {
    const { className } = props;

    const {
        readme: { initialize }
    } = useCore().functions;

    const { lang } = useLang();

    useEffect(() => {
        initialize({ lang });
    }, [lang]);

    const { isReady, markdown } = useCoreState("readme", "main");

    const { classes, cx } = useStyles();

    if (!isReady) {
        return <LoadingFallback />;
    }

    return (
        <div className={cx(classes.root, className)}>
            <Markdown className={classes.markdown}>
                {markdown.split("---").reverse()[0]}
            </Markdown>
        </div>
    );
}

const useStyles = tss.withName({ Readme }).create({
    "root": {
        "display": "flex",
        "justifyContent": "center"
    },
    "markdown": {
        "borderRadius": fr.spacing("2v"),
        "maxWidth": 900,
        "padding": fr.spacing("4v"),
        ...fr.spacing("margin", {
            "topBottom": "6v"
        })
    }
});
