import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { fr } from "@codegouvfr/react-dsfr";
import { SearchMultiInput } from "ui/shared/SearchMultiInput";
import type { FormData } from "core/usecases/softwareForm";
import type { useCore } from "core";
import { declareComponentKeys } from "i18nifty";
import { useTranslation, useResolveLocalizedString } from "ui/i18n";
import type { ReturnType } from "tsafe";

export type Step4Props = {
    className?: string;
    initialFormData: FormData["step4"] | undefined;
    onSubmit: (formData: FormData["step4"]) => void;
    evtActionSubmit: NonPostableEvt<void>;
    getWikidataOptions: (
        queryString: string
    ) => Promise<
        ReturnType<
            ReturnType<typeof useCore>["functions"]["softwareForm"]["getWikidataOptions"]
        >
    >;
};

export function SoftwareFormStep4(props: Step4Props) {
    const { className, initialFormData, onSubmit, evtActionSubmit, getWikidataOptions } =
        props;

    const { t } = useTranslation({ SoftwareFormStep4 });
    const { handleSubmit, control } = useForm<FormData["step4"]>({
        "defaultValues": (() => {
            if (initialFormData === undefined) {
                return {
                    "similarSoftwares": []
                };
            }

            return initialFormData;
        })()
    });

    const [submitButtonElement, setSubmitButtonElement] =
        useState<HTMLButtonElement | null>(null);

    const { t: tCommon } = useTranslation({ "App": null });

    const { resolveLocalizedString } = useResolveLocalizedString();

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
            onSubmit={handleSubmit(formData => onSubmit(formData))}
        >
            <Controller
                name="similarSoftwares"
                control={control}
                render={({ field }) => (
                    <SearchMultiInput
                        debounceDelay={400}
                        getOptions={getWikidataOptions}
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
                            "label": t("similar software"),
                            "hintText": t("similar software hint"),
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

export const { i18n } = declareComponentKeys<
    "similar software" | "similar software hint"
>()({ SoftwareFormStep4 });
