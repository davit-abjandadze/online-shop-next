import styled from "styled-components";

export const Form = styled("form")<{ isLoading: boolean }>`
  position: relative;

  &::before {
    ${({ isLoading }) => isLoading && `content: "";`}
    position: absolute;
    z-index: 11;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.5);
  }

  &::after {
    ${({ isLoading }) => isLoading && `content: "";`}
    display: block;
    position: absolute;
    z-index: 12;
    top: 50%;
    left: 50%;
    margin: -12px;
    border-radius: 50%;
    border: 4px solid ${({ theme }) => theme.colors.base._100};
    border-top-color: transparent;
    width: 24px;
    height: 24px;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
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
