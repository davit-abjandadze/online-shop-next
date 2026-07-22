import styled from "styled-components";

import { Hidden as RGSHidden } from "react-grid-system";
import { useEffect, useState } from "react";

const HiddenSSR = styled("div")<{
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
  xxxl?: boolean;
}>`
  ${({ xs }) =>
    xs
      ? `
    display:none !important;
`
      : ""}
  ${({ sm, theme }) =>
    sm
      ? `
        @media(min-width:${theme.breakpoints.sm}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.sm}){
            display:block !important;
        }
`}
  ${({ md, theme }) =>
    md
      ? `
        @media(min-width:${theme.breakpoints.md}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.md}){
            display:block !important;
        }
`}
  ${({ lg, theme }) =>
    lg
      ? `
        @media(min-width:${theme.breakpoints.lg}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.lg}){
            display:block !important;
        }
`}
  ${({ lg, theme }) =>
    lg
      ? `
        @media(min-width:${theme.breakpoints.lg}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.lg}){
            display:block !important;
        }
`}
  ${({ xl, theme }) =>
    xl
      ? `
        @media(min-width:${theme.breakpoints.xl}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.xl}){
            display:block !important;
        }
`}
  ${({ xxl, theme }) =>
    xxl
      ? `
        @media(min-width:${theme.breakpoints.xxl}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.xxl}){
            display:block !important;
        }
`}
  ${({ xxxl, theme }) =>
    xxxl
      ? `
        @media(min-width:${theme.breakpoints.xxxl}){
            display:none !important;
        }
`
      : `
        @media(min-width:${theme.breakpoints.xxxl}){
            display:block !important;
        }
`}
`;

type HiddenProps = {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xl2?: boolean;
  xxl?: boolean;
  xxxl?: boolean;
  onlyRGS?: boolean;
  children?: React.ReactNode;
};

const Hidden: React.FC<HiddenProps> = (props) => {
  // const isSSR = typeof window !== "undefined";
  const [isSSR, setIsSSR] = useState(true);
  useEffect(() => {
    setIsSSR(typeof window == "undefined");
  }, []);
  return (
    <>
      {!isSSR || props.onlyRGS ? (
        <RGSHidden {...({ ...props, children: undefined } as any)}>
          {props.children}
        </RGSHidden>
      ) : (
        <HiddenSSR {...props} />
      )}
    </>
  );
};

export default Hidden;
