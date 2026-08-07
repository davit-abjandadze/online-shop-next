import styled from "styled-components";

export const Wrapper = styled("div")`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const Card = styled("div")`
  max-width: 420px;
  width: 100%;
  text-align: center;
  background: var(--ref-bg-elevated, #fff);
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

export const Title = styled("h2")`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

export const Text = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary, #666);
  margin: 0 0 24px 0;
`;

export const Button = styled("button")`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: var(--ref-primary, #2563eb);
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
`;
