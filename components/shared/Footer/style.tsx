import Link from "next/link";
import styled from "styled-components";
import css from "styled-jsx/css";
import { transparentize } from "polished";
import Button from "@/components/ui/Button";

export const Footer = styled("footer")<{ isDetails?: boolean }>`
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.base._2};
  padding: 20px 16px;
  padding-bottom: ${({ isDetails }) => (isDetails ? 64 : 20)}px;
  & #top-ge-counter-container {
    width: 88px;
    height: 31px;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 14px;
    padding: 40px 42px 24px;
    color: ${({ theme }) => theme.colors.text.strong};

    & #top-ge-counter-container {
      bottom: 0;
      left: 184px;
    }
  }
`;

export const Container = styled("div")`
  max-width: 1390px;
  margin: 0 auto;
`;

export const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 48px;
  position: relative;
`;

export const List = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 232px;

  & > span {
    font-size: 16px;
  }
`;

export const ListBlock = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;

  & a span {
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 400;
  }

  & a span:hover {
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

export const Main = styled("div")`
  flex-direction: column;
  display: flex;
  gap: 25px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    justify-content: space-between;
    flex-direction: row;
    gap: 16px;
  }
`;

export const SubMain = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Bottom = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BottomMenu = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;

  & a {
    color: ${({ theme }) => theme.colors.text.strong};
    transition: all 0.2s;
  }

  & a:hover {
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    align-items: start;
    gap: 24px;
  }
`;

export const Owner = styled(Link)<{ hoverImage: string }>`
  position: relative;
  font-size: 0;

  & img {
    height: 32px;
  }

  &::before {
    content: "";
    background: url(${({ hoverImage }) => hoverImage});
    background-size: 100% 100%;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  & img,
  &::before {
    transition: all 0.2s;
  }

  &:hover img {
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
`;

export const SideBlock = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  max-width: 322px;
  justify-content: space-between;
`;

export const ButtonGroups = styled("div")`
  display: flex;
  justify-content: space-between;
  gap: 28px;
`;

export const ButtonGroup = styled("div")`
  display: flex;
  gap: 8px;
`;

export const HotLine = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 18px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    line-height: 22px;
  }
`;

export const SideBlockMain = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  line-height: 22px;
`;

export const SideBlockSubMenu = styled("div")`
  display: flex;
  gap: 16px;
  justify-content: start;

  & span {
    cursor: pointer;
    transition: all 0.2s;
  }

  & a:hover span {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    justify-content: space-between;
  }
`;

export const LangMenu = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;

  & span {
    color: ${({ theme }) => theme.colors.text.strong};
    font-weight: 500;
  }

  & div {
    display: flex;
    gap: 10px;
  }
`;

export const TopGEPlaceholder = styled("div")`
  width: 88px;
  height: 31px;
`;

export const LangLink = styled(Button)<{ isActive: boolean }>`
  @media (max-width: ${({ theme }) => parseInt(theme.breakpoints.lg) - 1}px) {
    pointer-events: ${({ isActive }) => (isActive ? "none" : "unset")};
    width: 32px;
    height: 32px;
    transition: all 0.2s;

    &:hover {
      cursor: pointer;
      box-shadow: 0 0 0 3px
        ${({ theme }) => transparentize(0.66, theme.colors.primary)};
    }
  }

  background: ${({ theme, isActive }) =>
    isActive
      ? transparentize(0.9, theme.colors.primary)
      : theme.colors.base._5};
  border: ${({ theme, isActive }) =>
    isActive ? `1px solid ${theme.colors.primary}` : "none"};
`;
