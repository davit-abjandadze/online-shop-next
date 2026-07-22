import React, { useCallback } from "react";
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import { useTheme } from "styled-components";
import * as S from "./style";
import {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
} from "react-select";
import Icon from "../Icon";
import { latinToCyrillic, latinToGeorgian } from "@/utils/chatTransforms";

type DropdownProps = {
  name: string;
  control?: Control<FieldValues, any>;
  defaultValue?: FieldValues | string | number | null;
  options: {
    label: string;
    value: string | number;
  }[];
  validationRules?: RegisterOptions;
  placeholder?: string;
  errorMessage?: string;
  isClearable?: boolean;
  iconName?: string;
  disabled?: boolean;
  className?: string;
  isSearchable?: boolean;
  onFocus?: (e: any) => void;
  onChange?: (newValue: any) => void;
  onChangeCallback?: (newValue: any) => void;
  NoOptionsMessage?: (props: any) => JSX.Element;
  withIcon?: boolean;
  isErrored?: boolean;
  menuPosition?: "fixed" | "absolute";
};

const Control = ({ children, ...props }: ControlProps) => {
  const theme = useTheme();
  // @ts-ignore
  const iconName = props.selectProps.iconName;

  return (
    <components.Control {...props}>
      {iconName ? (
        <Icon
          style={{
            fontSize: 20,
            color: theme.colors.text.soft,
            marginRight: 8,
          }}
          name={iconName}
        />
      ) : null}
      {children}
    </components.Control>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  const { menuIsOpen } = props.selectProps;
  return (
    <components.DropdownIndicator {...props}>
      <Icon
        style={{
          fontSize: 24,
          width: 20,
          height: 20,
        }}
        name={menuIsOpen ? "expand_less" : "expand_more"}
      />
    </components.DropdownIndicator>
  );
};

const ClearIndicator = (props: ClearIndicatorProps) => {
  return (
    <components.ClearIndicator {...props}>
      <Icon style={{ fontSize: 20 }} name="close" />
    </components.ClearIndicator>
  );
};

const Dropdown: React.FC<DropdownProps> = ({
  control,
  name,
  options,
  defaultValue = null,
  validationRules = {},
  placeholder = "",
  errorMessage = "",
  isClearable = false,
  iconName = "",
  disabled = false,
  className = "",
  isSearchable = true,
  onChange,
  onFocus,
  onChangeCallback,
  NoOptionsMessage,
  withIcon,
  isErrored,
  menuPosition,
}) => {
  const onMenuOpen = () => {
    setTimeout(() => {
      const selectedEl = document.getElementsByClassName(
        "select__option--is-selected"
      )[0];
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "start",
        });
      }
    }, 15);
  };

  const findNestedValue = (options: any, value: any) => {
    if (!options) return undefined;
    if (!options[0].options) return undefined;
    let toReturn = undefined;
    options.forEach((o: any) => {
      o.options.forEach((o2: any) => {
        if (o2.value == value) {
          toReturn = o2;
        }
      });
    });
    return toReturn;
  };

  const customFilter = useCallback((candidate: any, input: string) => {
    if (input) {
      if (
        candidate.label.includes(input) ||
        candidate.label.includes(latinToGeorgian(input)) ||
        candidate.label.includes(latinToCyrillic(input))
      ) {
        return true;
      }
      return false;
    }
    return true; // if not search, then all match
  }, []);

  const components = {
    DropdownIndicator,
    ClearIndicator,
    Control,
    NoOptionsMessage,
  };

  if (!NoOptionsMessage) {
    delete components.NoOptionsMessage;
  }

  if (control) {
    return (
      <div className={className}>
        <Controller
          control={control}
          defaultValue={defaultValue}
          name={name}
          rules={validationRules}
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { invalid, isTouched, isDirty, error },
            formState,
          }) => (
            <>
              <S.Dropdown
                ref={ref}
                name={name}
                value={value}
                options={options}
                onBlur={onBlur}
                onChange={(val) => {
                  if (onChangeCallback) {
                    onChangeCallback(val);
                  }
                  onChange(val);
                }}
                isSearchable={isSearchable}
                onFocus={(e) => onFocus && onFocus(e)}
                placeholder={placeholder}
                isClearable={isClearable}
                classNamePrefix="select"
                components={components}
                className={invalid || isErrored ? " select--is-errored" : ""}
                isDisabled={disabled}
                // @ts-ignore
                iconName={iconName}
                menuPosition={menuPosition}
                menuPlacement="auto"
              />
              {invalid || isErrored ? (
                <S.ErrorMessage>{errorMessage ?? ""}</S.ErrorMessage>
              ) : null}
            </>
          )}
        />
      </div>
    );
  } else {
    const potentialDefaultValue = !!defaultValue
      ? (defaultValue as any).value
        ? defaultValue
        : options.length > 0 && !!(options[0] as any)?.options
        ? findNestedValue(options, defaultValue)
        : options.find((x) => x.value == defaultValue)
      : defaultValue;

    return (
      <>
        <S.Dropdown
          className={isErrored ? `${className} select--is-errored` : className}
          name={name}
          value={potentialDefaultValue}
          options={options}
          placeholder={placeholder}
          isClearable={isClearable}
          classNamePrefix="select"
          isDisabled={disabled}
          isSearchable={isSearchable}
          components={components}
          filterOption={customFilter}
          onChange={(newVal) => {
            if (onChange) {
              onChange((newVal as any).value);
            }
          }}
          onFocus={(e) => onFocus && onFocus(e)}
          onMenuOpen={onMenuOpen}
          menuShouldScrollIntoView
          // @ts-ignore
          iconName={iconName}
          withIcon={withIcon}
          menuPosition={menuPosition}
        />
        {isErrored ? (
          <S.ErrorMessage>{errorMessage ?? ""}</S.ErrorMessage>
        ) : null}
      </>
    );
  }
};

export default Dropdown;
