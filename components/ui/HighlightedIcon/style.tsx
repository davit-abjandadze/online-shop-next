import styled from "styled-components";
import { HighlightIconProps } from ".";

export const HighlightIconContainer = styled("div")<HighlightIconProps>`
  width: 40px;
  height: 40px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${({ circle }) => (circle ? "50%" : "8px")};
  color: ${({ theme, variant }) => {
    let iconColor;
    if (variant === "purple") {
      iconColor = theme.colors.purple;
    } else if (variant === "blue") {
      iconColor = theme.colors.primary;
    } else if (variant === "green") {
      iconColor = theme.colors.success;
    } else if (variant === "yellow") {
      iconColor = theme.colors.tertiary;
    } else if (variant === "light") {
      iconColor = theme.colors.primary;
    }

    return iconColor;
  }};
  background-color: ${({ theme, variant, nonPale }) =>
    variant === "pink"
      ? theme.colors.background["pink"]
      : variant === "red"
      ? theme.colors.background["red"]
      : variant === "aquaGreen"
      ? theme.colors.background["aquaGreen"]
      : variant === "light"
      ? theme.colors.base._2
      : nonPale
      ? theme.colors.background[variant]
      : theme.colors.blankBackground[variant]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 52px;
    height: 52px;
  }
`;

export const HighlightIcon = styled("span")<{
  color: string | undefined;
  size: string;
}>`
  ${({ color }) => color && `color: ${color}`};
  font-size: ${({ size }) => size};
`;

export const HighlightedImage = styled("img")<{ size: number | string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  object-fit: contain;
`;
