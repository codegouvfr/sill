import { useEffect, useState, useId } from "react";
import { SearchInput } from "ui/shared/SearchInput";
import { fr } from "@codegouvfr/react-dsfr";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { CircularProgressWrapper } from "ui/shared/CircularProgressWrapper";
import { assert } from "tsafe/assert";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import type { useCore } from "core";
import type { FormData } from "core/usecases/softwareForm";
import type { ReturnType } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useTranslation, useResolveLocalizedString } from "ui/i18n";
import { useStyles } from "tss-react/dsfr";

export type Step2Props = {
    className?: string;
    isUpdateForm: boolean;
    initialFormData: FormData["step2"] | undefined;
    onSubmit: (formData: FormData["step2"]) => void;
    evtActionSubmit: NonPostableEvt<void>;
    getAutofillDataFromWikidata: ReturnType<
        typeof useCore
    >["functions"]["softwareForm"]["getAutofillData"];
    getLibreSoftwareWikidataOptions: (
        queryString: string
    ) => Promise<
        ReturnType<
            ReturnType<
                typeof useCore
            >["functions"]["softwareForm"]["getExternalSoftwareOptions"]
        >
    >;
};

export function SoftwareFormStep2(props: Step2Props) {
    const {
        className,
        isUpdateForm,
        initialFormData,
        onSubmit,
        evtActionSubmit,
        getLibreSoftwareWikidataOptions,
        getAutofillDataFromWikidata
    } = props;

    const { t } = useTranslation({ SoftwareFormStep2 });
    const { t: tCommon } = useTranslation({ "App": "App" });
    const { resolveLocalizedString } = useResolveLocalizedString();

    const {
        handleSubmit,
        control,
        register,
        watch,
        formState: { errors },
        setValue
    } = useForm<{
        wikidataEntry:
            | ReturnType<typeof getLibreSoftwareWikidataOptions>[number]
            | undefined;
        comptoirDuLibreIdInputValue: string;
        softwareName: string;
        softwareDescription: string;
        softwareLicense: string;
        softwareMinimalVersion: string;
        softwareLogoUrl: string;
        keywordsInputValue: string;
    }>({
        "defaultValues": (() => {
            if (initialFormData === undefined) {
                return undefined;
            }

            const { comptoirDuLibreId, externalId, softwareKeywords, ...rest } =
                initialFormData ?? {};

            return {
                ...rest,
                "wikidataEntry":
                    externalId === undefined
                        ? undefined
                        : {
                              externalId,
                              "description": "",
                              "label": rest.softwareName
                          },
                "comptoirDuLibreIdInputValue":
                    comptoirDuLibreId === undefined
                        ? ""
                        : comptoirDuLibreIdToComptoirDuLibreInputValue(comptoirDuLibreId),
                "keywordsInputValue": softwareKeywords.join(", ")
            };
        })()
    });

    const [submitButtonElement, setSubmitButtonElement] =
        useState<HTMLButtonElement | null>(null);

    useEvt(
        ctx => {
            if (submitButtonElement === null) {
                return;
            }

            evtActionSubmit.attach(ctx, () => submitButtonElement.click());
        },
        [evtActionSubmit, submitButtonElement]
    );

    const wikidataInputId = useId();

    const { isAutocompleteInProgress } = (function useClosure() {
        const [isAutocompleteInProgress, setIsAutocompleteInProgress] = useState(false);

        const wikiDataEntry = watch("wikidataEntry");

        useEffect(() => {
            if (wikiDataEntry === undefined || isUpdateForm) {
                return;
            }

            let isActive = true;

            (async () => {
                setIsAutocompleteInProgress(true);

                const {
                    comptoirDuLibreId,
                    softwareName,
                    softwareDescription,
                    softwareLicense,
                    softwareMinimalVersion,
                    softwareLogoUrl
                } = await getAutofillDataFromWikidata({
                    "externalId": wikiDataEntry.externalId
                });

                if (!isActive) {
                    return;
                }

                {
                    const [wikidataInputElement] =
                        document.getElementsByClassName(wikidataInputId);

                    assert(wikidataInputElement !== null);

                    wikidataInputElement.scrollIntoView({ "behavior": "smooth" });
                }

                if (comptoirDuLibreId !== undefined) {
                    setValue(
                        "comptoirDuLibreIdInputValue",
                        comptoirDuLibreIdToComptoirDuLibreInputValue(comptoirDuLibreId)
                    );
                }

                if (softwareDescription !== undefined) {
                    setValue("softwareDescription", softwareDescription);
                }

                if (softwareLicense !== undefined) {
                    setValue("softwareLicense", softwareLicense);
                }

                if (softwareMinimalVersion !== undefined) {
                    setValue("softwareMinimalVersion", softwareMinimalVersion);
                }

                if (softwareName !== undefined) {
                    setValue("softwareName", softwareName);
                }

                if (softwareLogoUrl !== undefined) {
                    setValue("softwareLogoUrl", softwareLogoUrl);
                }

                setIsAutocompleteInProgress(false);
            })();

            return () => {
                isActive = false;
            };
        }, [wikiDataEntry]);

        return { isAutocompleteInProgress };
    })();

    const { css } = useStyles();

    return (
        <form
            className={className}
            onSubmit={handleSubmit(
                ({
                    comptoirDuLibreIdInputValue,
                    wikidataEntry,
                    softwareLogoUrl,
                    keywordsInputValue,
                    ...rest
                }) =>
                    onSubmit({
                        ...rest,
                        "softwareLogoUrl":
                            softwareLogoUrl === "" ? undefined : softwareLogoUrl,
                        "softwareKeywords": keywordsInputValue
                            .split(",")
                            .map(s => s.trim()),
                        "comptoirDuLibreId":
                            comptoirDuLibreIdInputValue === ""
                                ? undefined
                                : comptoirDuLibreInputValueToComptoirDuLibreId(
                                      comptoirDuLibreIdInputValue
                                  ),
                        "externalId": wikidataEntry?.externalId
                    })
            )}
        >
            <Controller
                name="wikidataEntry"
                control={control}
                rules={{ "required": false }}
                render={({ field }) => (
                    <SearchInput
                        className={wikidataInputId}
                        debounceDelay={400}
                        getOptions={getLibreSoftwareWikidataOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        getOptionLabel={wikidataEntry =>
                            resolveLocalizedString(wikidataEntry.label)
                        }
                        renderOption={(liProps, wikidataEntity) => (
                            <li {...liProps} key={wikidataEntity.externalId}>
                                <div>
                                    <span>
                                        {resolveLocalizedString(wikidataEntity.label)}
                                    </span>
                                    <br />
                                    <span className={fr.cx("fr-text--xs")}>
                                        {resolveLocalizedString(
                                            wikidataEntity.description
                                        )}
                                    </span>
                                </div>
                            </li>
                        )}
                        noOptionText={tCommon("no result")}
                        loadingText={tCommon("loading")}
                        dsfrInputProps={{
                            "label": t("wikidata id"),
                            "hintText": t("wikidata id hint", {
                                "wikidataUrl": "https://www.wikidata.org/wiki",
                                "wikidataPageExampleUrl":
                                    "https://www.wikidata.org/wiki/Q107693197",
                                "softwareSillUrl":
                                    "https://code.gouv.fr/sill/detail?name=Keycloakify",
                                "exampleSoftwareName": "Keycloakify"
                            }),
                            "nativeInputProps": {
                                "ref": field.ref,
                                "onBlur": field.onBlur,
                                "name": field.name
                            }
                        }}
                    />
                )}
            />
            <p className="fr-info-text">{t("autofill notice")}</p>
            <div
                style={{
                    "display": "flex",
                    "alignItems": "end"
                }}
            >
                <CircularProgressWrapper
                    className={css({ "flex": 1 })}
                    isInProgress={isAutocompleteInProgress}
                    renderChildren={({ style }) => (
                        <Input
                            disabled={isAutocompleteInProgress}
                            style={{
                                ...style,
                                "marginTop": fr.spacing("4v")
                            }}
                            label={t("logo url")}
                            hintText={t("logo url hint")}
                            nativeInputProps={{
                                ...register("softwareLogoUrl", {
                                    "pattern": /^(?:https:)?\/\//
                                })
                            }}
                            state={
                                errors.softwareLogoUrl !== undefined ? "error" : undefined
                            }
                            stateRelatedMessage={t("must be an url")}
                        />
                    )}
                />
                {watch("softwareLogoUrl") && (
                    <img
                        src={watch("softwareLogoUrl")}
                        alt={t("logo preview alt")}
                        style={{
                            "marginLeft": fr.spacing("4v"),
                            "border": `1px dotted ${fr.colors.decisions.border.default.grey.default}`,
                            "width": 100,
                            "height": 100,
                            "objectFit": "cover",
                            "objectPosition": "left"
                        }}
                    />
                )}
            </div>
            <CircularProgressWrapper
                isInProgress={isAutocompleteInProgress}
                renderChildren={({ style }) => (
                    <Input
                        disabled={isAutocompleteInProgress}
                        style={{
                            ...style,
                            "marginTop": fr.spacing("4v")
                        }}
                        label={t("comptoir du libre id")}
                        hintText={t("comptoir du libre id hint")}
                        nativeInputProps={{
                            ...register("comptoirDuLibreIdInputValue", {
                                "validate": value => {
                                    try {
                                        comptoirDuLibreInputValueToComptoirDuLibreId(
                                            value
                                        );
                                    } catch {
                                        return false;
                                    }

                                    return true;
                                }
                            })
                        }}
                        state={
                            errors.comptoirDuLibreIdInputValue !== undefined
                                ? "error"
                                : undefined
                        }
                        stateRelatedMessage={t("invalid comptoir du libre id")}
                    />
                )}
            />
            <CircularProgressWrapper
                isInProgress={isAutocompleteInProgress}
                renderChildren={({ style }) => (
                    <Input
                        disabled={isAutocompleteInProgress}
                        style={{
                            ...style,
                            "marginTop": fr.spacing("4v")
                        }}
                        label={t("software name")}
                        nativeInputProps={{
                            ...register("softwareName", { "required": true })
                        }}
                        state={errors.softwareName !== undefined ? "error" : undefined}
                        stateRelatedMessage={tCommon("required")}
                    />
                )}
            />
            <CircularProgressWrapper
                isInProgress={isAutocompleteInProgress}
                renderChildren={({ style }) => (
                    <Input
                        disabled={isAutocompleteInProgress}
                        style={{
                            ...style,
                            "marginTop": fr.spacing("4v")
                        }}
                        label={t("software feature")}
                        hintText={t("software feature hint")}
                        nativeInputProps={{
                            ...register("softwareDescription", { "required": true })
                        }}
                        state={
                            errors.softwareDescription !== undefined ? "error" : undefined
                        }
                        stateRelatedMessage={tCommon("required")}
                    />
                )}
            />
            <CircularProgressWrapper
                isInProgress={isAutocompleteInProgress}
                renderChildren={({ style }) => (
                    <Input
                        disabled={isAutocompleteInProgress}
                        style={{
                            ...style,
                            "marginTop": fr.spacing("4v")
                        }}
                        label={t("license")}
                        hintText={t("license hint")}
                        nativeInputProps={{
                            ...register("softwareLicense", { "required": true })
                        }}
                        state={errors.softwareLicense !== undefined ? "error" : undefined}
                        stateRelatedMessage={tCommon("required")}
                    />
                )}
            />
            <CircularProgressWrapper
                isInProgress={isAutocompleteInProgress}
                renderChildren={({ style }) => (
                    <Input
                        disabled={isAutocompleteInProgress}
                        style={{
                            ...style,
                            "marginTop": fr.spacing("4v")
                        }}
                        label={t("minimal version")}
                        hintText={t("minimal version hint")}
                        nativeInputProps={{
                            ...register("softwareMinimalVersion", { "required": true })
                        }}
                        state={
                            errors.softwareMinimalVersion !== undefined
                                ? "error"
                                : undefined
                        }
                        stateRelatedMessage={tCommon("required")}
                    />
                )}
            />
            <Input
                disabled={isAutocompleteInProgress}
                style={{
                    "marginTop": fr.spacing("4v")
                }}
                label={t("keywords")}
                hintText={t("keywords hint")}
                nativeInputProps={{
                    ...register("keywordsInputValue")
                }}
            />
            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}

function comptoirDuLibreIdToComptoirDuLibreInputValue(comptoirDuLibreId: number) {
    return `https://comptoir-du-libre.org/fr/softwares/${comptoirDuLibreId}`;
}

function comptoirDuLibreInputValueToComptoirDuLibreId(comptoirDuLibreInputValue: string) {
    if (comptoirDuLibreInputValue === "") {
        return undefined;
    }

    number: {
        const n = parseInt(comptoirDuLibreInputValue);

        if (isNaN(n)) {
            break number;
        }

        return n;
    }

    url: {
        if (
            !comptoirDuLibreInputValue.startsWith(
                "https://comptoir-du-libre.org/fr/softwares/"
            )
        ) {
            break url;
        }

        const n = parseInt(comptoirDuLibreInputValue.split("/").reverse()[0]);

        if (isNaN(n)) {
            break url;
        }

        return n;
    }

    assert(false);
}

export const { i18n } = declareComponentKeys<
    | "wikidata id"
    | {
          K: "wikidata id hint";
          P: {
              wikidataUrl: string;
              wikidataPageExampleUrl: string;
              exampleSoftwareName: string;
              softwareSillUrl: string;
          };
          R: JSX.Element;
      }
    | "wikidata id information"
    | "comptoir du libre id"
    | "comptoir du libre id hint"
    | "software name"
    | "software feature"
    | "software feature hint"
    | "license"
    | "license hint"
    | "minimal version"
    | "minimal version hint"
    | "url or numeric id"
    | "invalid comptoir du libre id"
    | "autofill notice"
    | "logo url"
    | "logo url hint"
    | "must be an url"
    | "keywords"
    | "keywords hint"
    | "logo preview alt"
>()({ SoftwareFormStep2 });
