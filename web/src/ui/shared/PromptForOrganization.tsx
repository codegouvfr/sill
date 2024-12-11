import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { declareComponentKeys } from "i18nifty";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import { useGetOrganizationFullName, useTranslation } from "ui/i18n";
import { useCore, useCoreState } from "../../core";
import { AutocompleteFreeSoloInput } from "./AutocompleteFreeSoloInput";
import { LoadingFallback } from "./LoadingFallback";

export const PromptForOrganization = ({ firstTime }: { firstTime?: boolean }) => {
    const { t } = useTranslation({ PromptForOrganization });
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
        <div className={fr.cx("fr-container", "fr-py-6w")}>
            <h1 className={fr.cx("fr-h1")}>{t("title")}</h1>
            <p>{t("organization is required")}</p>

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
                        "label": t("organization"),
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
                            {t("update")}
                        </Button>
                        {organization.isBeingUpdated && <CircularProgress size={30} />}
                    </>
                )}
            </div>
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
