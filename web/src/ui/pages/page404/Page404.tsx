// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { PageRoute } from "./route";

type Props = {
    className?: string;
    route?: PageRoute;
};

export default function Page404(props: Props) {
    const { className } = props;

    return <div className={className}>Not found</div>;
}
