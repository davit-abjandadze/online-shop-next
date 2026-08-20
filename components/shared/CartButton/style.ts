import styled from "styled-components";

export const Wrapper = styled("button")`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ref-border-soft);
  border-radius: 50%;
  background: var(--ref-bg-subtle);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--ref-border-soft);
    border-color: var(--ref-primary);
  }
`;

export const Badge = styled("span")`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;
