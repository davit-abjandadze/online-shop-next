import { transparentize } from "polished";
import styled from "styled-components";

export const TextInput = styled("label")`
  display: block;
`;

const InputLabels = styled("span")`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.soft};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  pointer-events: none;
`;

export const Label = styled(InputLabels)<{ active?: boolean }>`
  margin-top: -9px;
  position: absolute;
  top: ${({ active }) => (active ? "12px" : "50%")};
  left: 12px;
  right: 12px;
  transition: top 0.2s;

  input:focus + &,
  input:-webkit-autofill + & {
    top: 12px;
  }
`;

export const Affix = styled(InputLabels)`
  padding: 12px;
`;

export const ErrorMessage = styled("div")`
  color: ${({ theme }) => theme.colors.red};
  margin-top: 4px;
  font-size: 12px;
  line-height: 1;
`;

export const InputBlock = styled("div")<{
  isDisabled: boolean;
  isInvalid: boolean;
  isFocused: boolean;
  readonly?: boolean;
  $ardiInput?: boolean;
}>`
  cursor: ${({ readonly }) => (readonly ? "default" : "default")};
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s, border 0.3s;
  background-color: ${({ isDisabled }) => (isDisabled ? "#eee" : "white")};
  box-shadow: 0 0 0 ${({ isFocused }) => (isFocused ? 3 : 0)}px
    ${({ theme, isInvalid, $ardiInput }) =>
      transparentize(
        0.75,
        isInvalid ? theme.colors.red : $ardiInput ? theme.colors.ardi : theme.colors.primary
      )};
  border: 1px solid
    ${({ theme, isInvalid, isFocused, $ardiInput }) =>
      isInvalid
        ? theme.colors.red
        : isFocused
        ? $ardiInput ? theme.colors.ardi : theme.colors.primary
        : theme.colors.base._20};
`;

export const Input = styled("input")<{
  inputSize: string;
  isLabeled: boolean;
}>`
  width: 100%;
  display: block;
  color: ${({ theme }) => theme.colors.text.strong};
  flex-grow: 1;
  margin: 0;
  padding: 11px;
  font-weight: 500;
  line-height: 1;
  border: none;
  outline: none;
  background-color: transparent;
  padding-top: ${({ inputSize, isLabeled }) =>
    isLabeled ? (inputSize === "regular" ? 21 : 19) : 11}px;
  font-size: ${({ inputSize }) => (inputSize === "regular" ? 18 : 14)}px;
  height: ${({ inputSize }) => (inputSize === "regular" ? 54 : 48)}px;

  &:disabled::placeholder,
  &:disabled {
    color: ${({ theme }) => theme.colors.text.soft};
  }
`;

export const AfixElemContainer = styled("div")`
  flex-shrink: 0;
`;
