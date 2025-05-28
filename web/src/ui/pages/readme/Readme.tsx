import { useTranslation } from "react-i18next";
import { MarkdownPage } from "ui/shared/MarkdownPage";

export default function Readme() {
    const { t } = useTranslation();

    return <MarkdownPage>{t("about.text")}</MarkdownPage>;
}
