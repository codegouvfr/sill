import { useEffect, useReducer } from "react";
import MuiCircularProgress from "@mui/material/CircularProgress";
import { useStyles } from "tss-react/dsfr";

type Props = {
    className?: string;
    /** Default 1000 (1 second) */
    showAfterMs?: number;
};

export const loadingFallbackClassName = "loading-fallback";

export function LoadingFallback(props: Props) {
    const { className, showAfterMs = 1000 } = props;

    const { cx, css } = useStyles();

    const [isCircularProgressShown, showCircularProgress] = useReducer(() => true, false);

    useEffect(() => {
        let isActive = true;

        const timer = setTimeout(() => {
            if (!isActive) {
                return;
            }

            showCircularProgress();
        }, showAfterMs);

        return () => {
            clearTimeout(timer);
            isActive = false;
        };
    }, [showAfterMs]);

    return (
        <div
            className={cx(
                css({
                    "display": "flex",
                    "justifyContent": "center",
                    "alignItems": "center"
                }),
                loadingFallbackClassName,
                className
            )}
        >
            {isCircularProgressShown && <MuiCircularProgress />}
        </div>
    );
}
