import { useState, useMemo, type ReactNode, type HTMLAttributes } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import { createUseDebounce } from "powerhooks/useDebounce";
import { same } from "evt/tools/inDepth/same";
import { useRerenderOnChange } from "powerhooks/tools/StatefulObservable/hooks/useRerenderOnChange";
import { CircularProgressWrapper } from "ui/shared/CircularProgressWrapper";

export type SearchInputProps<T extends string | Record<string, unknown>> = {
    className?: string;
    value: T | undefined;
    onValueChange: (value: T | undefined) => void;
    debounceDelay: number;
    getOptions: (inputText: string) => Promise<T[]>;
    getOptionLabel: (value: T) => string;
    renderOption?: (liProps: HTMLAttributes<HTMLLIElement>, option: T) => ReactNode;
    noOptionText: ReactNode;
    loadingText: ReactNode;
    dsfrInputProps: InputProps.RegularInput;
};

export function SearchInput<T extends string | Record<string, unknown>>(
    props: SearchInputProps<T>
) {
    const {
        className,
        value,
        onValueChange,
        debounceDelay,
        getOptions,
        getOptionLabel,
        renderOption,
        noOptionText,
        loadingText,
        dsfrInputProps
    } = props;

    const { useDebounce, obsIsDebouncing } = useMemo(
        () => createUseDebounce({ "delay": debounceDelay }),
        [debounceDelay]
    );
    const [options, setOptions] = useState<readonly T[]>([]);
    const [inputValue, setInputValue] = useState("");

    const { isOpen, onClose, onOpen } = (function useClosure() {
        const [isOpenAccordingToMui, setIsOpenAccordingToMui] = useState(false);

        return {
            "isOpen": isOpenAccordingToMui && inputValue !== "",
            "onOpen": () => setIsOpenAccordingToMui(true),
            "onClose": () => setIsOpenAccordingToMui(false)
        };
    })();

    const { isLoading, setIsGettingOptions } = (function useClosure() {
        useRerenderOnChange(obsIsDebouncing);

        const [isGettingOptions, setIsGettingOptions] = useState(false);

        return {
            "isLoading": isGettingOptions || obsIsDebouncing.current,
            setIsGettingOptions
        };
    })();

    useDebounce(() => {
        if (inputValue === "") {
            setOptions([]);
            return;
        }

        let isActive = true;

        (async () => {
            setOptions([]);
            setIsGettingOptions(true);

            const options = await getOptions(inputValue);

            if (!isActive) {
                return;
            }

            setOptions(options);
            setIsGettingOptions(false);
        })();

        return () => {
            isActive = false;
        };
    }, [inputValue]);

    return (
        <Autocomplete
            className={className}
            open={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            onInputChange={(_event, newValue) => setInputValue(newValue)}
            onChange={(_event, newValue) => onValueChange(newValue ?? undefined)}
            value={value ?? null}
            filterOptions={(options: T[]) => options}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            noOptionsText={noOptionText}
            loadingText={loadingText}
            options={options}
            loading={isLoading}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            isOptionEqualToValue={(option: T, value: T) => same(option, value)}
            renderInput={params => (
                <CircularProgressWrapper
                    isInProgress={isLoading && isOpen}
                    renderChildren={({ style }) => (
                        <Input
                            {...dsfrInputProps}
                            style={{
                                ...style,
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
                                    dsfrInputProps.nativeInputProps?.onMouseDown?.(
                                        ...args
                                    )
                            }}
                        />
                    )}
                />
            )}
        />
    );
}
