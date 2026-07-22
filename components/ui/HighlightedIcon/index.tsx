import React from "react";
import * as S from "./style";

export type HighlightIconProps = {
  variant:
    | "purple"
    | "blue"
    | "green"
    | "yellow"
    | "light"
    | "pink"
    | "red"
    | "aquaGreen";
  filled?: boolean;
  icon?: string;
  circle?: boolean;
  image?: string;
  size?: number | string;
  sizeFull?: boolean;
  color?: string;
  nonPale?: boolean;
};

const HighlightIcon: React.FC<HighlightIconProps> = ({
  variant,
  icon,
  filled,
  circle,
  image,
  size = 28,
  sizeFull,
  color,
  nonPale,
}) => {
  const sizeValue = () =>
    sizeFull ? "100%" : typeof size === "string" ? size : size + "px";

  return (
    <S.HighlightIconContainer
      circle={circle}
      variant={variant ?? "blue"}
      nonPale={nonPale}
    >
      {icon ? (
        <S.HighlightIcon
          color={color}
          size={sizeValue()}
          className={`icon-${icon}${filled ? "-fill" : ""}`}
        />
      ) : image ? (
        <S.HighlightedImage src={image} size={sizeValue()} />
      ) : null}
    </S.HighlightIconContainer>
  );
};

export default HighlightIcon;
