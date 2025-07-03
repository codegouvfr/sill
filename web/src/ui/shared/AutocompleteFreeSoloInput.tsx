import { type ReactNode, type HTMLAttributes } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fr } from "@codegouvfr/react-dsfr";
import { assert } from "tsafe/assert";
import { useConst } from "powerhooks/useConst";
import { useConstCallback } from "powerhooks/useConstCallback";

export type AutocompleteFreeSoloInputProps = {
    disabled?: boolean;
    className?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: string[];
    getOptionLabel?: (option: string) => string;
    renderOption?: (liProps: HTMLAttributes<HTMLLIElement>, option: string) => ReactNode;
    dsfrInputProps: InputProps.RegularInput;
};

export function AutocompleteFreeSoloInput(props: AutocompleteFreeSoloInputProps) {
    const {
        className,
        value,
        onValueChange,
        options,
        getOptionLabel: getOptionLabel_props,
        renderOption,
        dsfrInputProps,
        disabled
    } = props;

    const { getOptionFormLabel, getOptionLabel } = (function useClosure() {
        const getOptionLabel_props_const = useConstCallback(
            getOptionLabel_props ?? ((option: string) => option)
        );

        const { getOptionFormLabel, getOptionLabel } = useConst(() => {
            const optionByLabel = new Map<string, string>();

            const getOptionFormLabel = (
                label: string | number | readonly string[] | undefined
            ): string => {
                assert(typeof label === "string");

                const option = optionByLabel.get(label);

                if (option === undefined) {
                    return label;
                }

                return option;
            };

            const getOptionLabel = (option: string): string => {
                const label = getOptionLabel_props_const(option);

                optionByLabel.set(label, option);

                return label;
            };

            return { getOptionFormLabel, getOptionLabel };
        });

        return { getOptionFormLabel, getOptionLabel };
    })();

    return (
        <Autocomplete
            className={cx(fr.cx("fr-input-group"), className)}
            freeSolo
            disablePortal
            options={options}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            onChange={(_, value) => {
                if (value === null) {
                    return;
                }
                onValueChange(value);
            }}
            value={value}
            renderInput={params => (
                <Input
                    {...dsfrInputProps}
                    style={{
                        width: params.size,
                        ...dsfrInputProps.style
                    }}
                    ref={params.InputProps.ref}
                    disabled={disabled}
                    nativeInputProps={{
                        ...params.inputProps,
                        ...dsfrInputProps.nativeInputProps,
                        value: getOptionFormLabel(params.inputProps.value),
                        ref: element =>
                            [
                                (params.inputProps as any).ref,
                                dsfrInputProps.nativeInputProps?.ref
                            ].forEach(ref => {
                                if (ref === undefined || ref === null) {
                                    return;
                                }

                                if (typeof ref === "function") {
                                    ref(element);
                                } else {
                                    (ref as any).current = element;
                                }
                            }),
                        onBlur: (...args) =>
                            params.inputProps.onBlur?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onBlur?.(...args),
                        onChange: (...args) => {
                            params.inputProps.onChange?.(...args);
                            onValueChange(args[0].target.value);
                        },
                        onFocus: (...args) =>
                            params.inputProps.onFocus?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onFocus?.(...args),
                        onMouseDown: (...args) =>
                            params.inputProps.onMouseDown?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onMouseDown?.(...args)
                    }}
                />
            )}
        />
    );
}
