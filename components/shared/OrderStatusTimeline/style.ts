import styled from "styled-components";

export const TimelineTitle = styled("h2")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
`;

export const TimelineList = styled("ul")`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const TimelineItem = styled("li")<{ isLast: boolean }>`
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: ${({ isLast }) => (isLast ? "0" : "20px")};

  &::before {
    content: "";
    position: absolute;
    left: 9px;
    top: 22px;
    bottom: 0;
    width: 2px;
    background: var(--ref-border-soft);
    display: ${({ isLast }) => (isLast ? "none" : "block")};
  }
`;

export const TimelineDot = styled("div")<{ variant: "success" | "danger" }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: #fff;
  background: ${({ variant }) =>
    variant === "danger" ? "var(--ref-danger)" : "var(--ref-success)"};
`;

export const TimelineBody = styled("div")`
  flex: 1;
  min-width: 0;
  padding-top: 1px;
`;

export const TimelineStatus = styled("div")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const TimelineMeta = styled("div")`
  font-size: 12px;
  color: var(--ref-text-secondary);
  margin-top: 2px;
`;
