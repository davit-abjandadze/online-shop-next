import styled from "styled-components";
import { motion } from "framer-motion";
import { transparentize } from "polished";

export const Backdrop = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 110;
  background-color: ${({ theme }) =>
    transparentize(0.5, theme.colors.base._100)};
`;

export const Container = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 112;
`;

export const Content = styled(motion.div)<{
  stretch?: boolean;
  autoScroll?: boolean;
}>`
  position: relative;
  width: 100%;
  max-height: calc(100% + 4rem);
  overflow-y: hidden;
  padding-bottom: 4rem;
  background-color: ${({ theme }) => theme.colors.base._0};
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  height: ${({ stretch }) => (stretch ? "100%" : "auto")};
  will-change: transform;
  ${({ autoScroll }) =>
    autoScroll &&
    `
    overflow-y: auto;
  `}
`;

export const Wrapper = styled(motion.div)<{
  stretch?: boolean;
  maxHeight?: number;
}>`
  position: absolute;
  bottom: -4rem;
  left: 0;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : "100%")};
  width: 100%;
  z-index: 111;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  height: ${({ stretch }) => (stretch ? "100%" : "auto")};

  ${Content} {
    height: ${({ maxHeight }) => (maxHeight ? "100%" : "auto")};
  }
`;

export const Handle = styled(motion.div)`
  position: absolute;
  width: 3.75rem;
  height: 0.25rem;
  margin: 1rem 0;
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.base._0};
  left: calc(50% - 1.875rem);
  top: -1.55rem;
`;
