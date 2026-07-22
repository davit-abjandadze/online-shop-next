import { motion } from "framer-motion";
import { transparentize } from "polished";
import styled from "styled-components";

export const Wrapper = styled(motion.div)<{
  isFocused: boolean;
  isInvalid?: boolean;
  isLoading: boolean;
  hightlighted: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 8px;
  transition: all 0.2s;

  & > textarea {
    box-shadow: 0 0 0 ${({ isFocused }) => (isFocused ? 3 : 0)}px
      ${({ theme, isInvalid }) =>
        transparentize(
          0.75,
          isInvalid === true ? theme.colors.red : theme.colors.primary
        )};
  }
  &::before {
    content: "";
    z-index: 2;
    display: ${({ isLoading }) => (isLoading ? "block" : "none")};
    position: absolute;
    right: 12px;
    top: 12px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.text.soft};
    border-top-color: transparent;
    width: 12px;
    height: 12px;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    background-color: white;
    box-shadow: 0 0 8px 8px white;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  ${({ isLoading, theme, isInvalid }) => {
    return isLoading
      ? ""
      : `
        &:hover::after {
          border: 1px solid ${
            isInvalid === true ? theme.colors.red : theme.colors.primary
          };
        }
      `;
  }}

  ${({ isFocused, isInvalid, theme }) => {
    return isFocused
      ? `
        & textarea {
          border: 1px solid ${
            isInvalid === true ? theme.colors.red : theme.colors.primary
          };
        }
      `
      : null;
  }}
`;

export const TextArea = styled("textarea")`
  padding: 16px;
  z-index: 1;
  border: 1px solid #e3e4e6;

  background-color: ${({ theme }) => theme.colors.base._2};
  border-radius: 10px;
  width: 100%;
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.strong};
  min-height: 70px;
  resize: none;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  position: relative;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    border: 1px solid transparent;
    min-height: 126px;
    font-size: 16px;
  }
`;

export const ActionWrapper = styled(motion.div)`
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const ErrorMessage = styled("div")`
  color: ${({ theme }) => theme.colors.red};
  margin-top: 4px;
  font-size: 12px;
  line-height: 1;
`;
