import { useEffect } from "react";
import { useCoreState, useCore } from "core";
import { useLang } from "ui/i18n";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import type { PageRoute } from "./route";
import { LoadingFallback } from "ui/shared/LoadingFallback";
import Markdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { MarkdownPage } from "ui/shared/MarkdownPage";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Terms() {
    const { t } = useTranslation();
    return <MarkdownPage>{t("terms.text")}</MarkdownPage>;
}
