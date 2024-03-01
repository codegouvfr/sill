import { useState, useId } from "react";
import { tss } from "tss-react/dsfr";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import {
    useTranslation,
    useLang,
    softwareCategoriesFrBySoftwareCategoryEn,
    useGetOrganizationFullName
} from "ui/i18n";
import { State as SoftwareCatalogState } from "core/usecases/softwareCatalog";
import MenuItem from "@mui/material/MenuItem";
import SelectMui from "@mui/material/Select";
import { InputBase } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { SelectNext } from "ui/shared/SelectNext";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";

export type Props = {
    className?: string;

    search: string;
    onSearchChange: (search: string) => void;

    organizationOptions: {
        organization: string;
        softwareCount: number;
    }[];
    organization: string | undefined;
    onOrganizationChange: (organization: string | undefined) => void;

    categoryOptions: {
        category: string;
        softwareCount: number;
    }[];
    category: string | undefined;
    onCategoryChange: (category: string | undefined) => void;

    environmentOptions: {
        environment: SoftwareCatalogState.Environment;
        softwareCount: number;
    }[];
    environment: SoftwareCatalogState.Environment | undefined;
    onEnvironmentChange: (
        environmentsFilter: SoftwareCatalogState.Environment | undefined
    ) => void;

    prerogativesOptions: {
        prerogative: SoftwareCatalogState.Prerogative;
        softwareCount: number;
    }[];
    prerogatives: SoftwareCatalogState.Prerogative[];
    onPrerogativesChange: (prerogatives: SoftwareCatalogState.Prerogative[]) => void;
};

export function SoftwareCatalogSearch(props: Props) {
    const {
        className,

        search,
        onSearchChange,

        organizationOptions,
        organization,
        onOrganizationChange,

        categoryOptions,
        category,
        onCategoryChange,

        environmentOptions,
        environment,
        onEnvironmentChange,

        prerogativesOptions,
        prerogatives,
        onPrerogativesChange,

        ...rest
    } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { t } = useTranslation({ SoftwareCatalogSearch });
    const { t: tCommon } = useTranslation({ "App": undefined });

    const [filtersWrapperDivElement, setFiltersWrapperDivElement] =
        useState<HTMLDivElement | null>(null);

    const { lang } = useLang();

    const [areFiltersOpen, setAreFiltersOpen] = useState(
        () =>
            organization !== undefined ||
            category !== undefined ||
            environment !== undefined ||
            prerogatives.length !== 0
    );

    useEffectOnValueChange(() => {
        if (!areFiltersOpen) {
            onOrganizationChange(undefined);
            onCategoryChange(undefined);
            onEnvironmentChange(undefined);
            onPrerogativesChange([]);
        }
    }, [areFiltersOpen]);

    const { classes, cx } = useStyles({
        "filterWrapperMaxHeight": areFiltersOpen
            ? filtersWrapperDivElement?.scrollHeight ?? 0
            : 0
    });

    const filtersWrapperId = `filter-wrapper-${useId()}`;

    const { getOrganizationFullName } = useGetOrganizationFullName();

    return (
        <div className={classes.root}>
            <div className={cx(classes.basicSearch, className)}>
                <SearchBar
                    className={classes.searchBar}
                    label={t("placeholder")}
                    renderInput={({ className, id, placeholder, type }) => {
                        const [inputElement, setInputElement] =
                            useState<HTMLInputElement | null>(null);

                        return (
                            <input
                                ref={setInputElement}
                                className={className}
                                id={id}
                                placeholder={placeholder}
                                type={type}
                                value={search}
                                onChange={event =>
                                    onSearchChange(event.currentTarget.value)
                                }
                                onKeyDown={event => {
                                    if (event.key === "Escape") {
                                        assert(inputElement !== null);
                                        inputElement.blur();
                                    }
                                }}
                            />
                        );
                    }}
                />
                <Button
                    className={classes.filterButton}
                    iconId={
                        areFiltersOpen ? "ri-arrow-up-s-fill" : "ri-arrow-down-s-fill"
                    }
                    iconPosition="right"
                    onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                    aria-expanded={areFiltersOpen ? "true" : "false"}
                    aria-controls={filtersWrapperId}
                >
                    {t("filters")}
                </Button>
            </div>
            <div
                className={classes.filtersWrapper}
                id={filtersWrapperId}
                ref={setFiltersWrapperDivElement}
            >
                <SelectNext
                    className={classes.filterSelectGroup}
                    label={
                        <>
                            {t("organizationLabel")}{" "}
                            <Tooltip title={t("organization filter hint")} arrow>
                                <i className={fr.cx("ri-question-line")} />
                            </Tooltip>
                        </>
                    }
                    nativeSelectProps={{
                        "onChange": event =>
                            onOrganizationChange(event.target.value || undefined),
                        "value": organization ?? ""
                    }}
                    disabled={organizationOptions.length === 0}
                    options={[
                        {
                            "label": tCommon("allFeminine"),
                            "value": ""
                        },
                        ...organizationOptions.map(({ organization, softwareCount }) => ({
                            "value": organization,
                            "label": `${getOrganizationFullName(
                                organization
                            )} (${softwareCount})`
                        }))
                    ]}
                />

                <SelectNext
                    className={classes.filterSelectGroup}
                    label={t("categoriesLabel")}
                    disabled={categoryOptions.length === 0}
                    nativeSelectProps={{
                        "onChange": event =>
                            onCategoryChange(event.target.value || undefined),
                        "value": category ?? ""
                    }}
                    options={[
                        {
                            "label": tCommon("allFeminine"),
                            "value": ""
                        },
                        ...categoryOptions
                            .map(({ category, softwareCount }) => ({
                                "value": category,
                                "label": `${
                                    lang === "fr"
                                        ? softwareCategoriesFrBySoftwareCategoryEn[
                                              category
                                          ] ?? category
                                        : category
                                } (${softwareCount})`
                            }))
                            .sort((a, b) => {
                                const labelA = a.label.toLowerCase();
                                const labelB = b.label.toLowerCase();
                                if (labelA < labelB) return -1;
                                if (labelA > labelB) return 1;
                                return 0;
                            })
                    ]}
                />

                <SelectNext
                    className={classes.filterSelectGroup}
                    label={t("environnement label")}
                    nativeSelectProps={{
                        "onChange": event =>
                            onEnvironmentChange(event.target.value || undefined),
                        "value": environment ?? ""
                    }}
                    options={[
                        {
                            "label": tCommon("all"),
                            "value": "" as const
                        },
                        ...environmentOptions.map(({ environment, softwareCount }) => ({
                            "value": environment,
                            "label": `${t(environment)} (${softwareCount})`
                        }))
                    ]}
                />

                <div className={classes.filterSelectGroup}>
                    <label htmlFor="prerogatives-label">{t("prerogativesLabel")}</label>
                    <SelectMui
                        multiple
                        displayEmpty={true}
                        value={prerogatives}
                        onChange={event => {
                            const prerogatives = event.target.value;

                            assert(typeof prerogatives !== "string");

                            onPrerogativesChange(prerogatives);
                        }}
                        className={cx(fr.cx("fr-select"), classes.multiSelect)}
                        input={<InputBase />}
                        renderValue={prerogatives =>
                            t("number of prerogatives selected", {
                                "count": prerogatives.length
                            })
                        }
                        placeholder="Placeholder"
                    >
                        {prerogativesOptions.map(({ prerogative, softwareCount }) => (
                            <MenuItem
                                key={prerogative}
                                value={prerogative}
                                disabled={softwareCount === 0}
                            >
                                <Checkbox
                                    checked={prerogatives.indexOf(prerogative) !== -1}
                                />
                                <ListItemText
                                    primary={(() => {
                                        switch (prerogative) {
                                            case "doRespectRgaa":
                                                return `${t(
                                                    "doRespectRgaa"
                                                )} (${softwareCount})`;
                                            case "isFromFrenchPublicServices":
                                                return `${t(
                                                    "isFromFrenchPublicServices"
                                                )} (${softwareCount})`;
                                            case "isInstallableOnUserComputer":
                                                return `${t(
                                                    "isInstallableOnUserComputer"
                                                )} (${softwareCount})`;
                                            case "isTestable":
                                                return `${t(
                                                    "isTestable"
                                                )} (${softwareCount})`;
                                            case "isPresentInSupportContract":
                                                return `${t(
                                                    "isPresentInSupportContract"
                                                )} (${softwareCount})`;
                                            case "isAvailableAsMobileApp":
                                                return `${t(
                                                    "isAvailableAsMobileApp"
                                                )} (${softwareCount})`;
                                        }
                                    })()}
                                />
                            </MenuItem>
                        ))}
                    </SelectMui>
                </div>
            </div>
        </div>
    );
}

SoftwareCatalogSearch.displayName = "SoftwareCatalogSearch";

const useStyles = tss
    .withName({ SoftwareCatalogSearch })
    .withParams<{ filterWrapperMaxHeight: number }>()
    .create(({ filterWrapperMaxHeight }) => ({
        "root": {
            "&:before": {
                "content": "none"
            }
        },
        "basicSearch": {
            "display": "flex",
            "paddingTop": fr.spacing("6v")
        },
        "searchBar": {
            "flex": 1
        },
        "filterButton": {
            "backgroundColor":
                fr.colors.decisions.background.actionLow.blueFrance.default,
            "&&&:hover": {
                "backgroundColor":
                    fr.colors.decisions.background.actionLow.blueFrance.hover
            },
            "color": fr.colors.decisions.text.actionHigh.blueFrance.default,
            "marginLeft": fr.spacing("4v")
        },
        "filtersWrapper": {
            "transition": "max-height 0.2s ease-out",
            "maxHeight": filterWrapperMaxHeight,
            "overflow": "hidden",
            "marginTop": fr.spacing("4v"),
            "display": "grid",
            "gridTemplateColumns": `repeat(4, minmax(20%, 1fr))`,
            "columnGap": fr.spacing("4v"),
            [fr.breakpoints.down("md")]: {
                "gridTemplateColumns": `repeat(1, 1fr)`
            },
            "paddingLeft": fr.spacing("1v")
        },
        "filterSelectGroup": {
            "&:not(:last-of-type)": {
                "borderRight": `1px ${fr.colors.decisions.border.default.grey.default} solid`,
                "paddingRight": fr.spacing("4v")
            },
            [fr.breakpoints.down("md")]: {
                "&:not(:last-of-type)": {
                    "border": "none"
                }
            }
        },
        "multiSelect": {
            "marginTop": fr.spacing("2v"),
            "paddingRight": 0,
            "& > .MuiInputBase-input": {
                "padding": 0
            },
            "& > .MuiSvgIcon-root": {
                "display": "none"
            }
        }
    }));

export const { i18n } = declareComponentKeys<
    | "filters"
    | "placeholder"
    | "filtersButton"
    | "organizationLabel"
    | "categoriesLabel"
    | "environnement label"
    | "prerogativesLabel"
    | "isInstallableOnUserComputer"
    | "isAvailableAsMobileApp"
    | "isPresentInSupportContract"
    | "isFromFrenchPublicServices"
    | "doRespectRgaa"
    | "isTestable"
    | "organization filter hint"
    | "linux"
    | "mac"
    | "windows"
    | "browser"
    | "stack"
    | "ios"
    | "android"
    | {
          K: "number of prerogatives selected";
          P: { count: number };
      }
>()({ SoftwareCatalogSearch });
