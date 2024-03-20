import { type ReactNode, type HTMLAttributes } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";

export type AutocompleteInputProps<T extends string | Record<string, unknown>> = {
    className?: string;
    value: T | undefined;
    onValueChange: (value: T | undefined) => void;
    options: T[];
    getOptionLabel: (value: T) => string;
    renderOption?: (liProps: HTMLAttributes<HTMLLIElement>, option: T) => ReactNode;
    noOptionText: ReactNode;
    dsfrInputProps: InputProps.RegularInput;
};

export function AutocompleteInput<T extends string | Record<string, unknown>>(
    props: AutocompleteInputProps<T>
) {
    const {
        className,
        value,
        onValueChange,
        options,
        getOptionLabel,
        renderOption,
        noOptionText,
        dsfrInputProps
    } = props;

    return (
        <Autocomplete
            className={className}
            disablePortal
            options={options}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            noOptionsText={noOptionText}
            value={value ?? null}
            onChange={(_event, newValue) => onValueChange(newValue ?? undefined)}
            renderInput={params => (
                <Input
                    {...dsfrInputProps}
                    style={{
                        "width": params.size,
                        ...dsfrInputProps.style
                    }}
                    ref={params.InputProps.ref}
                    nativeInputProps={{
                        ...params.inputProps,
                        ...dsfrInputProps.nativeInputProps,
                        "ref": element =>
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
                        "onBlur": (...args) =>
                            params.inputProps.onBlur?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onBlur?.(...args),
                        "onChange": (...args) =>
                            params.inputProps.onChange?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onChange?.(...args),
                        "onFocus": (...args) =>
                            params.inputProps.onFocus?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onFocus?.(...args),
                        "onMouseDown": (...args) =>
                            params.inputProps.onMouseDown?.(...args) ??
                            dsfrInputProps.nativeInputProps?.onMouseDown?.(...args)
                    }}
                />
            )}
        />
    );
}
