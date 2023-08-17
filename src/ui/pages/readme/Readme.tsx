import { useEffect } from "react";
import { Markdown } from "keycloakify/tools/Markdown";
import { useCoreFunctions, useCoreState, selectors } from "core";
import { tss } from "tss-react/dsfr";
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

    const { readme } = useCoreFunctions();

    const { lang } = useLang();

    useEffect(() => {
        readme.initialize({ lang });
    }, [lang]);

    const { markdown } = useCoreState(selectors.readme.markdown);

    const { classes, cx } = useStyles();

    if (markdown === undefined) {
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

const useStyles = tss.withName({ Readme }).createUseStyles({
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
