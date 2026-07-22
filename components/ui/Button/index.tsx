import React from "react";
import * as S from "./style";
import { Sizes } from "@/components/pages/real-estate-application/shared/data/enums";

export type ButtonProps = {
  btnSize?: Sizes | string;
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "blank"
    | "delete"
    | "outline"
    | "primary-transparent"
    | "success"
    | "ardi";
  fill?: boolean;
  icon?: string;
  iconPos?: "left" | "right";
  rounded?: boolean;
  iconFilled?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  square?: boolean;
  tab?: string;
  darkColor?: boolean;
  iconColor?: string;
  isLoading?: boolean;
  dark?: boolean;
};

const Button: React.FC<React.HTMLProps<HTMLButtonElement> & ButtonProps> = ({
  children,
  btnSize,
  variant,
  fill,
  icon,
  iconFilled,
  iconPos = "right",
  rounded,
  disabled,
  square,
  tab = "0",
  darkColor,
  iconColor = "inherit",
  isLoading = false,
  dark,
  ...rest
}) => {
  const button = (
    <S.Button
      {...(rest as any)}
      tabIndex={tab}
      btnSize={btnSize ?? Sizes.md}
      variant={variant ?? "primary"}
      fill={fill}
      icon={icon}
      iconPos={iconPos}
      disabled={disabled || isLoading}
      iconOnly={!children && !fill}
      rounded={rounded}
      square={square}
      darkColor={darkColor}
      iconColor={iconColor}
    >
      {icon && iconPos == "left" && (
        <span className={`icon-${icon}${iconFilled ? "-fill" : ""}`} />
      )}
      {children}
      {icon && iconPos == "right" && (
        <span className={`icon-${icon}${iconFilled ? "-fill" : ""}`} />
      )}
    </S.Button>
  );

  return isLoading ? (
    <S.BtnLoadingContainer
      variant={variant}
      icon={icon}
      iconPos={iconPos}
      darkColor={darkColor}
      dark={dark}
    >
      {button}
    </S.BtnLoadingContainer>
  ) : (
    <>{button}</>
  );
};

export default Button;
