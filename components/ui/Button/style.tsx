import styled from "styled-components";
import { ButtonProps } from ".";
import { Sizes } from "@/components/pages/real-estate-application/shared/data/enums";
import { darken, transparentize } from "polished";

interface StyledButtonProps extends ButtonProps {
  iconOnly?: boolean;
  square?: boolean;
  isLoading?: boolean;
  dark?: boolean;
  // darkColor?: boolean;
  // iconColor?: string;
}

export const BtnLoadingContainer = styled("div")<StyledButtonProps>`
  position: relative;
  width: auto;
  flex-grow: 0;
  margin-top: 6px;

  & button {
    min-width: 100%;
    color: ${({ icon }) => (icon ? null : "transparent")};
  }

  & button [class^="icon-"] {
    color: ${({ icon }) => (icon ? "transparent" : null)};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin-top: 0;
  }

  &::before {
    content: "";
    display: block;
    position: absolute;

    ${({ iconPos, icon, btnSize, square }) =>
      icon && iconPos === "left"
        ? `left: ${
            !square && (btnSize == Sizes.lg ? "28px" : !!icon ? "24px" : "24px")
          }`
        : icon && iconPos === "right"
          ? `right: ${
              !square &&
              (btnSize == Sizes.lg ? "28px" : !!icon ? "24px" : "24px")
            }`
          : "left: 50%; right: 50%"};

    top: 50%;
    border-radius: 50%;
    border: 2px solid
      ${({ theme, variant, darkColor, dark }) =>
        dark
          ? theme.colors.text.white
          : darkColor
            ? theme.colors.text.strong
            : variant == "primary" ||
                variant == "delete" ||
                variant == "success"
              ? theme.colors.text.white
              : variant == "blank"
                ? theme.colors.primary
                : theme.colors.text.white};
    border-top-color: transparent;
    width: 14px;
    height: 14px;
    margin: -9px;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;

    transform-origin: center;
    transform: rotate(0deg);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button = styled("button")<StyledButtonProps>`
  ${({ fill }) =>
    !!fill &&
    `
      width: 100%;
    `}
  height: ${({ btnSize }) =>
    btnSize == Sizes.md
      ? 48
      : btnSize == Sizes.sm
        ? 40
        : btnSize == Sizes.xs
          ? 32
          : 56}px;
  ${({ iconOnly, btnSize, square }) =>
    (iconOnly || square) &&
    ` 
      width: ${
        btnSize == Sizes.md
          ? 48
          : btnSize == Sizes.sm
            ? 40
            : btnSize == Sizes.xs
              ? 32
              : 56
      }px;
    `}
  display: flex;

  align-items: center;
  justify-content: center;
  background-color: ${({ theme, variant, disabled }) =>
    variant == "primary-transparent"
      ? transparentize(0.9, theme.colors.primaryLight)
      : variant == "outline"
        ? "white"
        : variant == "secondary"
          ? disabled
            ? theme.colors.secondaryLight
            : theme.colors.secondary
          : variant == "tertiary"
            ? disabled
              ? theme.colors.tertiaryLight
              : theme.colors.tertiary
            : variant == "success"
              ? disabled
                ? "#269c67"
                : theme.colors.success
              : variant == "delete"
                ? disabled
                  ? theme.colors.redLight
                  : theme.colors.red
                : variant == "blank"
                  ? "transparent"
                  : variant == "ardi"
                    ? disabled
                      ? transparentize(0.5, theme.colors.ardi)
                      : theme.colors.ardi
                    : disabled
                      ? theme.colors.primaryLight
                      : theme.colors.primary};
  padding: ${({ btnSize, icon, square }) =>
    !square && (btnSize == Sizes.lg ? "0 20px" : !!icon ? "0 16px" : "0 16px")};
  ${({ btnSize, icon, iconPos, iconOnly }) =>
    btnSize == Sizes.xs &&
    iconPos == "right" &&
    !!icon &&
    !iconOnly &&
    `
      padding-right: 12px;
    `}
  ${({ btnSize, icon, iconPos, iconOnly }) =>
    btnSize == Sizes.xs &&
    iconPos == "left" &&
    !!icon &&
    !iconOnly &&
    `
      padding-left: 12px;
    `}
  border-radius: ${({ rounded }) => (rounded ? "100px" : "6px")};
  border: ${({ variant, theme }) =>
    variant == "outline" ? `1px solid ${theme.colors.base._20}` : "none"};
  cursor: pointer;
  font-family: "Helvetica Neue";
  font-weight: 500;
  font-feature-settings: "case" on;
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border: ${({ variant, theme }) =>
      variant == "outline" ? `1px solid ${theme.colors.base._30}` : "none"};
  }

  &:active {
    background-color: ${({ variant, theme }) =>
      variant == "primary-transparent"
        ? transparentize(0.4, theme.colors.primaryLight)
        : variant == "outline"
          ? theme.colors.secondaryLight
          : "none"};
  }

  @media (min-width: 1024px) {
    &:hover {
      background-color: ${({ theme, variant }) =>
        variant == "primary-transparent"
          ? transparentize(0.66, theme.colors.primaryLight)
          : variant == "outline"
            ? "white"
            : variant == "secondary"
              ? theme.colors.secondaryDark
              : variant == "tertiary"
                ? theme.colors.tertiaryDark
                : variant == "success"
                  ? "#269c67"
                  : variant == "delete"
                    ? theme.colors.redDark
                    : variant == "ardi"
                      ? darken(0.05, theme.colors.ardi)
                      : variant == "blank"
                        ? theme.colors.base._5
                        : theme.colors.primaryDark};
    }
  }
  @media (max-width: 1024px) {
    &:active {
      background-color: ${({ theme, variant }) =>
        variant == "primary-transparent"
          ? transparentize(0.4, theme.colors.primaryLight)
          : variant == "outline"
            ? theme.colors.secondaryLight
            : variant == "secondary"
              ? theme.colors.secondaryDark
              : variant == "tertiary"
                ? theme.colors.tertiaryDark
                : variant == "success"
                  ? theme.colors.success
                  : variant == "delete"
                    ? theme.colors.redDark
                    : variant == "blank"
                      ? theme.colors.base._2
                      : variant == "ardi"
                        ? darken(0.05, theme.colors.ardi)
                        : theme.colors.primaryDark};
    }
  }
  pointer-events: ${({ disabled }) => (disabled ? "none" : "all")};
  color: ${({ theme, variant, disabled, darkColor }) =>
    darkColor
      ? theme.colors.text.strong
      : disabled
        ? ["primary", "tertiary", "delete", "sccess"].includes(variant!)
          ? theme.colors.text.whiteDisabled
          : theme.colors.text.disabled
        : variant == "primary" ||
            variant == "delete" ||
            variant == "success" ||
            variant == "ardi"
          ? theme.colors.text.white
          : variant == "blank" || variant == "primary-transparent"
            ? theme.colors.primary
            : theme.colors.text.strong};

  font-size: ${({ btnSize }) => (btnSize == Sizes.xs ? 12 : 14)}px;

  > span {
    max-width: 1em;
    overflow: visible;
    font-size: ${({ btnSize }) =>
      btnSize == Sizes.lg ? 24 : btnSize == Sizes.xs ? 16 : 20}px;
    margin-left: ${({ iconPos, btnSize, iconOnly }) =>
      iconPos == "right" && !iconOnly ? (btnSize == Sizes.xs ? 4 : 8) : 0}px;
    margin-right: ${({ iconPos, btnSize, iconOnly }) =>
      iconPos == "left" && !iconOnly ? (btnSize == Sizes.xs ? 4 : 8) : 0}px;
  }

  > [class^="icon-"] {
    color: ${({ iconColor }) => iconColor};
  }
`;
