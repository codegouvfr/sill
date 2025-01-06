import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { declareComponentKeys } from "i18nifty";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import { useGetOrganizationFullName } from "ui/i18n";
import { useTranslation } from "react-i18next";
import { useCore, useCoreState } from "../../core";
import { AutocompleteFreeSoloInput } from "./AutocompleteFreeSoloInput";
import { LoadingFallback } from "./LoadingFallback";

type PromptForOrganizationProps = {
    firstTime?: boolean;
};

export const PromptForOrganization = ({ firstTime }: PromptForOrganizationProps) => {
    const { t } = useTranslation();

    return (
        <div className={fr.cx("fr-container", "fr-py-6w")}>
            <h1 className={fr.cx("fr-h1")}>{t("promptForOrganization.title")}</h1>
            <p>{t("promptForOrganization.organization is required")}</p>
            <OrganizationField firstTime={firstTime} />
        </div>
    );
};

export const OrganizationField = ({ firstTime }: PromptForOrganizationProps) => {
    const { t } = useTranslation();
    const { classes } = useStyles();
    const { userAccountManagement } = useCore().functions;
    const userAccountManagementState = useCoreState("userAccountManagement", "main");

    const { getOrganizationFullName } = useGetOrganizationFullName();

    useEffect(() => {
        userAccountManagement.initialize();
    }, []);

    const [organizationInputValue, setOrganizationInputValue] = useState("");

    if (!userAccountManagementState) return <LoadingFallback />;

    const { allOrganizations, organization } = userAccountManagementState;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}
        >
            <AutocompleteFreeSoloInput
                className={classes.organizationInput}
                options={allOrganizations}
                getOptionLabel={organization => getOrganizationFullName(organization)}
                value={organization.value ?? ""}
                onValueChange={value => {
                    setOrganizationInputValue(value);
                }}
                dsfrInputProps={{
                    "label": t("promptForOrganization.organization"),
                    "disabled": organization.isBeingUpdated
                }}
                disabled={organization.isBeingUpdated}
            />
            {(firstTime ||
                (organizationInputValue &&
                    organization.value !== organizationInputValue)) && (
                <>
                    <Button
                        className={fr.cx("fr-ml-2w")}
                        onClick={() =>
                            userAccountManagement.updateField({
                                "fieldName": "organization",
                                "value": organizationInputValue
                            })
                        }
                        disabled={
                            organization.value === organizationInputValue ||
                            organization.isBeingUpdated
                        }
                    >
                        {t("promptForOrganization.update")}
                    </Button>
                    {organization.isBeingUpdated && <CircularProgress size={30} />}
                </>
            )}
        </div>
    );
};

const useStyles = tss.withName({ PromptForOrganization }).create({
    organizationInput: {
        flex: 1
    }
});

export const { i18n } = declareComponentKeys<
    "title" | "organization is required" | "update" | "organization"
>()({ PromptForOrganization });
