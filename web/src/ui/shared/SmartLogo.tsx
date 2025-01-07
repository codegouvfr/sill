import { useDomRect } from "powerhooks/useDomRect";
import softwareLogoPlaceholder from "ui/assets/software_logo_placeholder.png";
import { useTranslation } from "react-i18next";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr/fr";

type Props = {
    className?: string;
    logoUrl: string | undefined;
};

export function SmartLogo(props: Props) {
    const { className, logoUrl } = props;

    const { imgRef, isBanner } = (function useClosure() {
        const {
            ref: imgRef,
            domRect: { height, width }
        } = useDomRect();

        const isBanner = width === 0 || height === 0 ? undefined : width > height * 1.7;

        return { imgRef, isBanner };
    })();

    const { t } = useTranslation();

    const { cx } = useStyles();

    const { classes } = useStyles();

    console.log({ className, logoUrl, imgRef, isBanner });
    return (
        <img
            className={cx(classes.logo)}
            src={logoUrl ?? softwareLogoPlaceholder}
            alt={t("smartLogo.software logo")}
        />
    );
}

const useStyles = tss.withName({ SmartLogo }).create({
    "logo": {
        "marginLeft": fr.spacing("4v"),
        "border": `1px dotted ${fr.colors.decisions.border.default.grey.default}`,
        "width": 100,
        "height": 100,
        "objectFit": "cover",
        "objectPosition": "left"
    }
});
