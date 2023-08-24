import { memo, ReactNode, useEffect, useRef, useState } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";

export type Props = {
    className?: string;
    children: ReactNode;
};

export const ActionsFooter = memo((props: Props) => {
    const { className, children, ...rest } = props;
    assert<Equals<typeof rest, {}>>();

    const [isSticky, setIsSticky] = useState(true);
    const { classes, cx } = useStyles({ isSticky });
    const ref = useRef<HTMLDivElement>(null);

    const handleResize = () => {
        if (ref.current) {
            const bottomAnchorPosition =
                window.innerHeight - ref.current.getBoundingClientRect().bottom;

            if (bottomAnchorPosition === 0) {
                setIsSticky(true);
            }
            if (bottomAnchorPosition > 0) {
                setIsSticky(false);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleResize);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleResize);
            window.removeEventListener("resize", handleResize);
        };
    }, [ref]);

    useEffect(() => {
        handleResize();
    }, []);

    return (
        <div className={classes.root} ref={ref}>
            <div className={cx(fr.cx("fr-container"), className)}>{children}</div>
        </div>
    );
});

const useStyles = tss
    .withName({ ActionsFooter })
    .withParams<{ isSticky: boolean }>()
    .create(({ isSticky }) => ({
        "root": {
            "position": "sticky",
            "bottom": "0",
            "marginTop": fr.spacing("6v"),
            "boxShadow": `${
                isSticky
                    ? `0 -5px 5px -5px ${fr.colors.decisions.background.overlap.grey.active}`
                    : `0 0 5px -5px ${fr.colors.decisions.background.overlap.grey.active}`
            }`,
            "transition": "box-shadow 0.3s ease",
            ...fr.spacing("padding", {
                "top": "4v",
                "bottom": "6v"
            }),
            "background": fr.colors.decisions.background.default.grey.default,
            "zIndex": 1
        }
    }));
