import React, {
  useState,
  FC,
  ChangeEventHandler,
  FocusEvent,
  FocusEventHandler,
  Ref,
  ReactNode,
} from "react";
import * as S from "./style";
import { ChangeHandler, RefCallBack } from "react-hook-form";

type TextInputProps = {
  id?: string;
  inputSize?: "regular" | "small";
  name?: string;
  value?: string | number;
  label?: string;
  postfix?: string;
  prefixElement?: ReactNode;
  postfixElement?: ReactNode;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<any>;
  className?: string;
  validationData?: {
    name?: string;
    onChange?: ChangeHandler;
    onBlur?: ChangeHandler;
    ref?: RefCallBack;
    invalid?: boolean;
    errorMessage?: string;
  };
  [x: string]: any;
  maxlength?: number;
  $ardiInput?: boolean;
};

const TextInput: FC<TextInputProps> = ({
  id,
  inputSize = "regular",
  name,
  value = "",
  label = "",
  postfix = "",
  prefixElement,
  postfixElement,
  placeholder = "",
  type = "text",
  disabled = false,
  readOnly = false,
  onChange,
  onFocus,
  onBlur,
  inputRef,
  validationData,
  className = "",
  maxlength,
  $ardiInput,
  ...rest
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <S.TextInput id={id} className={className}>
      <S.InputBlock
        isFocused={focus}
        isDisabled={disabled}
        isInvalid={!!validationData?.invalid}
        readonly={rest.readonly}
        $ardiInput={$ardiInput}
      >
        {prefixElement ? (
          <S.AfixElemContainer>{prefixElement}</S.AfixElemContainer>
        ) : null}
        <S.Input
          {...(rest as any[])}
          isLabeled={!!label}
          inputSize={inputSize}
          maxLength={maxlength}
          type={type == "number" ? "text" : type}
          name={validationData?.name ?? name}
          value={value || undefined}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            if (type == "number" && /^[0-9]*$/g.test(e.target.value) == false) {
              return;
            }
            if (validationData?.onChange) {
              validationData?.onChange(e);
            } else if (onChange) {
              onChange(e);
            }
          }}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            if (validationData?.onBlur) {
              validationData?.onBlur(event);
            } else {
              onBlur?.(event);
            }

            setFocus(false);
          }}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            onFocus?.(event);
            setFocus(true);
          }}
          ref={validationData?.ref ?? inputRef}
        />
        {label ? (
          <S.Label active={value !== "" || placeholder !== ""}>{label}</S.Label>
        ) : null}
        {postfix ? <S.Affix>{postfix}</S.Affix> : null}
        {postfixElement ? (
          <S.AfixElemContainer>{postfixElement}</S.AfixElemContainer>
        ) : null}
      </S.InputBlock>
      {validationData?.invalid ? (
        <S.ErrorMessage>{validationData?.errorMessage ?? ""}</S.ErrorMessage>
      ) : null}
    </S.TextInput>
  );
};

export default TextInput;
