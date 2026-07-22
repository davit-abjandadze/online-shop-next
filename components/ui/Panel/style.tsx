import styled from "styled-components";

export const PanelBackground = styled("div")`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Panel = styled("div")`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  height: 100%;
`;

export const Header = styled("header")`
  padding: 16px;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.base._10};
`;

export const Content = styled("section")`
  flex-grow: 1;
  overflow-y: auto;
`;
