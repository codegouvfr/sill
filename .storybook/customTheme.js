import { create } from "@storybook/theming";

const brandImage= "social-preview.png";
const brandTitle= "sill-web";
const brandUrl= "https://github.com/codegouvfr/sill-web";
const fontBase= '"Marianne", arial, sans-serif';
const fontCode= "monospace";

export const darkTheme = create({
    "base": "dark",
    "appBg": "#1E1E1E",
    "appContentBg": "#161616",
    "barBg": "#161616",
    "colorSecondary": "#8585F6",
    "textColor": "#FFFFFF",
    brandImage,
    brandTitle,
    brandUrl,
    fontBase,
    fontCode
});

export const lightTheme = create({
    "base": "light",
    "appBg": "#F6F6F6",
    "appContentBg": "#FFFFFF",
    "barBg": "#FFFFFF",
    "colorSecondary": "#000091",
    "textColor": "#212121",
    brandImage,
    brandTitle,
    brandUrl,
    fontBase,
    fontCode
});
