import styled from "styled-components";

import { Container as RGSContainer } from "react-grid-system";
import { useEffect, useState } from "react";

const ContainerSSR = styled("div")<{
  fill?: boolean;
}>`
  margin: 0 auto;
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    max-width: ${({ theme }) => theme.containerSizes.sm};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    max-width: ${({ theme }) => theme.containerSizes.md};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 100%;
    max-width: ${({ theme }) => theme.containerSizes.lg};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    width: 100%;
    max-width: ${({ theme }) => theme.containerSizes.xl};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xxl}) {
    width: 100%;
    max-width: ${({ theme }) => theme.containerSizes.xxl};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xxxl}) {
  }

  @media print {
    width: 100%;
    max-width: 100%;
    margin: 0;
  }
`;

type ContainerProps = {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
  xxxl?: boolean;
  children?: React.ReactNode;
};

const Container: React.FC<ContainerProps> = (props) => {
  return <ContainerSSR {...props} />;
};

export default Container;
