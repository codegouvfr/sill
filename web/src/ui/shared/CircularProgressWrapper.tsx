// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { ReactNode, CSSProperties } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export type Props = {
    className?: string;
    style?: CSSProperties;
    isInProgress: boolean;
    renderChildren: (params: { style: CSSProperties }) => ReactNode;
};

export function CircularProgressWrapper(props: Props) {
    const { className, style, isInProgress, renderChildren } = props;

    return (
        <div
            className={className}
            style={{
                ...style,
                position: "relative"
            }}
        >
            {renderChildren({
                style: {
                    marginBottom: 0
                }
            })}
            {isInProgress && (
                <CircularProgress
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0
                    }}
                    color="inherit"
                    size={20}
                />
            )}
        </div>
    );
}
