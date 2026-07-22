import { transparentize } from "polished";
import Select from "react-select";
import styled from "styled-components";

export const Dropdown = styled(Select)<{ withIcon?: boolean }>`
  & .select__control--is-disabled {
    background-color: #eee;
  }

  & .select__control--is-disabled .select__placeholder,
  & .select__control--is-disabled .select__single-value {
    color: ${({ theme }) => theme.colors.text.soft};
  }

  & .select__value-container {
    margin-right: ${({ withIcon }) => (withIcon ? "30px !important" : "0")};
  }

  & .select__control {
    height: 48px;
    border-radius: 8px;
    border-color: ${({ theme }) => theme.colors.base._20};
    outline: none;
    box-shadow: none;
    padding: 11px;
    cursor: pointer;

    &:hover {
      border-color: ${({ theme }) => theme.colors.base._20};
    }

    &.select__control--is-focused:hover {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  &.select--is-errored .select__control,
  &.select--is-errored .select__control.select__control--is-focused:hover {
    border-color: ${({ theme }) => theme.colors.red};
  }

  & .select__control--is-focused {
    box-shadow: 0 0 0 3px
      ${({ theme }) => transparentize(0.75, theme.colors.primary)};
    border: 1px solid ${({ theme }) => theme.colors.primary};
  }

  &.select--is-errored .select__control.select__control--is-focused {
    box-shadow: 0 0 0 3px
      ${({ theme }) => transparentize(0.75, theme.colors.red)};
  }

  & .select__value-container {
    padding: 0;
    height: 20px;
    font-weight: 500;
    font-size: 14px;
    line-height: 1;
  }
  & .select__single-value {
    color: ${({ theme }) => theme.colors.text.strong};
  }

  & .select__single-value,
  & .select__placeholder {
    margin: 0;
    line-height: 20px;
  }

  & .select__input-container {
    padding: 0;
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colors.text.strong};
  }

  & .select__dropdown-indicator {
    font-size: 20px;
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.text.soft};
  }

  & .select__clear-indicator {
    font-size: 24px;
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.text.soft};
  }

  & .select__indicator-separator {
    display: none;
  }

  & .select__dropdown-indicator {
    padding-top: 1px;
  }

  & .select__option {
    background-color: ${({ theme }) => theme.colors.base._0};
    cursor: pointer;

    &.select__option--is-selected,
    &.select__option--is-selected:focus,
    &.select__option--is-selected:hover {
      cursor: default;
      background-color: ${({ theme }) => theme.colors.primary};
    }

    &:focus {
      background-color: ${({ theme }) =>
        transparentize(0.9, theme.colors.primary)};
    }

    &:hover {
      background-color: ${({ theme }) =>
        transparentize(0.9, theme.colors.primary)};
    }
  }
`;

export const ErrorMessage = styled("div")`
  color: ${({ theme }) => theme.colors.red};
  margin-top: 4px;
  font-size: 12px;
  line-height: 1;
`;
