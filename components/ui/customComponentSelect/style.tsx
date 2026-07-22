import { transparentize } from "polished";
import styled from "styled-components";

export const Select = styled("div")<{
  maxWidth: number;
  dropDownLeft: boolean;
}>`
  position: relative;
  max-width: ${({ maxWidth }) => maxWidth}px;
  width: 100%;

  &.select.light-select {
    & .select__button {
      border: 1px solid transparent;
      background-color: transparent;
    }

    & .select__button:hover {
      background-color: ${({ theme }) =>
        transparentize(0.33, theme.colors.base._2)};
    }
  }

  .select {
    * {
      user-select: none;
      box-sizing: border-box;

      &:focus {
        outline: 2px solid orangered;
        outline-offset: -2px;
        z-index: 1;
      }
    }

    &__menu {
      ${({ dropDownLeft }) => {
        if (dropDownLeft) {
          return "right: 0;";
        } else {
          return "left: 0;";
        }
      }}
      min-width: 260px;
      width: 100%;
      position: absolute;
      z-index: 99;
      margin-top: 8px;
      max-height: 320px;
      overflow-y: auto;
      border-radius: 6px;
      background: white;
      border: 1px solid ${({ theme }) => theme.colors.base._10};
      box-shadow: 0px 7px 14px 0px ${() => transparentize(0.93, "black")};
    }

    &__button {
      display: flex;
      align-items: center;
      height: 38px;
      border-radius: 6px;
      border: 1px solid ${({ theme }) => theme.colors.base._5};
      background-color: ${({ theme }) => theme.colors.base._2};
      transition: box-shadow 0.3s ease 0s, border 0.3s ease 0s,
        background-color 0.3s ease 0s;
      cursor: pointer;

      &:focus {
        outline: none;
        box-shadow: ${({ theme }) => transparentize(0.75, theme.colors.primary)}
          0px 0px 0px 3px;
        border-color: ${({ theme }) => theme.colors.primary} !important;
      }

      &:hover {
        border-color: ${({ theme }) => theme.colors.base._30};
      }
    }

    &__search {
      outline: none;
      height: 32px;
      flex: 1;
      border: 1px solid transparent;
      padding: 0;
      margin: 3px;
      border-radius: 4px;
      padding-left: 34px;

      &:focus {
        outline: none;
        box-shadow: ${({ theme }) => transparentize(0.75, theme.colors.primary)}
          0px 0px 0px 3px;
        border-color: ${({ theme }) => theme.colors.primary};
      }
    }

    &__search-block {
      flex-grow: 1;
      display: flex;
      position: relative;

      & > [class^="icon-"] {
        pointer-events: none;
        z-index: 1;
        position: absolute;
        width: 100%;
        max-width: 38px !important;
        height: 38px;
        font-size: 20px;
      }
    }

    &__value {
      flex: 1;
      padding: 8px 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 12px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text.soft};
    }

    &__arrow {
      display: flex;
      margin: -1px;
    }

    &__btn {
      cursor: pointer;
      display: block;
      padding: 0;
      background-color: transparent;
      width: 38px;
      height: 38px;
      border: none;
    }

    &__icon {
      width: 20px;
      display: block;
      margin: 0 auto;
      text-align: center;
      font-size: 20px;
      line-height: 1;
      font-weight: bold;

      &--arrow-down {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
      }
    }

    &__menu-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;

      &--highlighted {
        background-color: ${({ theme }) => theme.colors.base._2};
      }

      & > span {
        padding: 12px 16px;
      }

      &--selected > span {
        font-weight: 500;
        color: ${({ theme }) => theme.colors.primary};
      }
    }

    &__no-res {
      text-align: center;
      color: ${({ theme }) => theme.colors.text.soft};
      font-style: italic;
      padding: 16px;
    }
  }
`;
