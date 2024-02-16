import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { assert } from "tsafe/assert";
import type { WikidataEntry } from "core/usecases/instanceForm";
import { AutocompleteInput } from "ui/shared/AutocompleteInput";
import { SearchMultiInput } from "ui/shared/SearchMultiInput";
import type { useCore } from "core";
import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";
import { useTranslation, useResolveLocalizedString } from "ui/i18n";

export type Step1Props = {
    className?: string;
    initialFormData: {
        mainSoftwareSillId: number | undefined;
        otherWikidataSoftwares: WikidataEntry[];
    };
    onSubmit: (formData: {
        mainSoftwareSillId: number;
        otherWikidataSoftwares: WikidataEntry[];
    }) => void;
    allSillSoftwares: {
        softwareName: string;
        softwareSillId: number;
        softwareDescription: string;
    }[];
    evtActionSubmit: NonPostableEvt<void>;
    getLibreSoftwareWikidataOptions: (
        queryString: string
    ) => ReturnType<
        ReturnType<
            typeof useCore
        >["functions"]["softwareForm"]["getExternalSoftwareOptions"]
    >;
};

export function InstanceFormStep1(props: Step1Props) {
    const {
        className,
        initialFormData,
        onSubmit,
        evtActionSubmit,
        getLibreSoftwareWikidataOptions,
        allSillSoftwares
    } = props;

    const { t } = useTranslation({ InstanceFormStep1 });
    const { t: tCommon } = useTranslation({ "App": null });
    const { resolveLocalizedString } = useResolveLocalizedString();

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm<{
        mainSoftware: {
            softwareName: string;
            softwareSillId: number;
            softwareDescription: string;
        };
        otherWikidataSoftwares: WikidataEntry[];
    }>({
        "defaultValues": {
            "mainSoftware": (() => {
                const { mainSoftwareSillId } = initialFormData;

                if (mainSoftwareSillId === undefined) {
                    return undefined;
                }

                const mainSoftware = allSillSoftwares.find(
                    ({ softwareSillId }) =>
                        softwareSillId === initialFormData.mainSoftwareSillId
                );

                assert(mainSoftware !== undefined);

                return mainSoftware;
            })(),
            "otherWikidataSoftwares": initialFormData.otherWikidataSoftwares
        }
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

    return (
        <form
            className={className}
            onSubmit={handleSubmit(data =>
                onSubmit({
                    "mainSoftwareSillId": data.mainSoftware.softwareSillId,
                    "otherWikidataSoftwares": data.otherWikidataSoftwares
                })
            )}
        >
            <Controller
                name="mainSoftware"
                rules={{ "required": true }}
                control={control}
                render={({ field }) => (
                    <AutocompleteInput
                        options={allSillSoftwares}
                        value={field.value}
                        onValueChange={value => field.onChange(value)}
                        getOptionLabel={entry => entry.softwareName}
                        renderOption={(liProps, entry) => (
                            <li {...liProps}>
                                <div>
                                    <span>{entry.softwareName}</span>
                                    <br />
                                    <span className={fr.cx("fr-text--xs")}>
                                        {entry.softwareDescription}
                                    </span>
                                </div>
                            </li>
                        )}
                        noOptionText={tCommon("no result")}
                        dsfrInputProps={{
                            "label": t("software instance"),
                            "nativeInputProps": {
                                "ref": field.ref,
                                "onBlur": field.onBlur,
                                "name": field.name
                            },
                            "state":
                                errors.mainSoftware === undefined ? undefined : "error",
                            "stateRelatedMessage": tCommon("required")
                        }}
                    />
                )}
            />

            <Controller
                name="otherWikidataSoftwares"
                control={control}
                render={({ field }) => (
                    <SearchMultiInput
                        debounceDelay={400}
                        getOptions={getLibreSoftwareWikidataOptions}
                        value={field.value}
                        onValueChange={value => field.onChange(value)}
                        getOptionLabel={wikidataEntry =>
                            resolveLocalizedString(wikidataEntry.label)
                        }
                        renderOption={(liProps, wikidataEntity) => (
                            <li {...liProps}>
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
                            "label": t("other software"),
                            "nativeInputProps": {
                                "ref": field.ref,
                                "onBlur": field.onBlur,
                                "name": field.name
                            }
                        }}
                    />
                )}
            />

            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}

export const { i18n } = declareComponentKeys<"software instance" | "other software">()({
    InstanceFormStep1
});
