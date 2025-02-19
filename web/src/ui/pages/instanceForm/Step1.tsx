import { fr } from "@codegouvfr/react-dsfr";
import type { WikidataEntry } from "core/usecases/instanceForm";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { assert } from "tsafe/assert";
import { useTranslation } from "react-i18next";
import { AutocompleteInput } from "ui/shared/AutocompleteInput";

export type Step1Props = {
    className?: string;
    initialFormData: {
        mainSoftwareSillId: number | undefined;
    };
    onSubmit: (formData: { mainSoftwareSillId: number }) => void;
    allSillSoftwares: {
        softwareName: string;
        softwareSillId: number;
        softwareDescription: string;
    }[];
    evtActionSubmit: NonPostableEvt<void>;
};

export function InstanceFormStep1(props: Step1Props) {
    const { className, initialFormData, onSubmit, evtActionSubmit, allSillSoftwares } =
        props;

    const { t } = useTranslation();

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
        defaultValues: {
            mainSoftware: (() => {
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
            })()
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
                    mainSoftwareSillId: data.mainSoftware.softwareSillId
                })
            )}
        >
            <Controller
                name="mainSoftware"
                rules={{ required: true }}
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
                        noOptionText={t("app.no result")}
                        dsfrInputProps={{
                            label: t("instanceFormStep1.software instance"),
                            nativeInputProps: {
                                ref: field.ref,
                                onBlur: field.onBlur,
                                name: field.name
                            },
                            state:
                                errors.mainSoftware === undefined ? undefined : "error",
                            stateRelatedMessage: t("app.required")
                        }}
                    />
                )}
            />

            <button
                style={{ display: "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
