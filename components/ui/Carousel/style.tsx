import styled from "styled-components";
import { motion } from "framer-motion";

export const Container = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  & * {
    user-select: none !important;
    -webkit-touch-callout: none !important;
  }
`;

const Arrow = styled(motion.div)`
  display: none;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.base._0};
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  > span {
    font-size: 28px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

export const ArrowRight = styled(Arrow)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 14px;
`;

export const ArrowLeft = styled(Arrow)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 14px;
`;

export const Wrapper = styled(motion.div)`
  display: flex;
  overflow: hidden;
  position: relative;
  height: 100%;
  width: 100%;
`;

export const ItemWrapper = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 100%;
  height: 100%;
  width: 100%;
  flex-shrink: 0;
  & > * {
    flex-shrink: 0;
  }
  * {
    user-select: none !important;
    user-drag: none;
  }
`;

export const BulletContainer = styled("div")`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 10px;
  right: 10px;
  z-index: 5;
`;

export const BulletItem = styled("div")<{ active?: boolean }>`
  font-size: 1.5rem;
  margin: 0.125rem;
  line-height: 0.5rem;
  /* transform: scale(${({ active }) => (active ? "1.1" : "0.9")}); */
  color: ${({ theme, active }) =>
    active ? theme.colors.text.white : theme.colors.text.whiteDisabled};
`;
