import { fr } from "@codegouvfr/react-dsfr";
import Markdown from "react-markdown";
import { tss } from "tss-react";

type Props = {
    className?: string;
    children: string;
};

export const MarkdownPage = (props: Props) => {
    const { className } = props;

    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, className)}>
            <Markdown className={classes.markdown}>{props.children}</Markdown>
        </div>
    );
};

const useStyles = tss.withName({ MarkdownPage }).create({
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
