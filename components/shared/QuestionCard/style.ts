import styled from "styled-components";

export const QuestionCardWrapper = styled("div")`
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
`;

export const CardTop = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
`;

export const FavoriteButton = styled("button")<{ active?: boolean }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: ${({ active }) => (active ? "#f59e0b" : "#94a3b8")};
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #f59e0b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const QuestionText = styled("h3")`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const Badge = styled("span")<{ variant?: "single" | "multiple" | "countdown" | "expired" | "category" }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 6px;

  ${({ variant }) => {
    switch (variant) {
      case "multiple":
        return "background: #fef3c7; color: #b45309;";
      case "countdown":
        return "background: #ffedd5; color: #c2410c;";
      case "expired":
        return "background: #fee2e2; color: #dc2626;";
      case "category":
        return "background: #f1f5f9; color: #64748b;";
      default:
        return "background: #dbeafe; color: #1d4ed8;";
    }
  }}
`;

/* Voting Options */
export const OptionsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

export const OptionItem = styled("div")<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: 12px;
  border: 2px solid ${({ selected }) => (selected ? "#2563eb" : "#e2e8f0")};
  background-color: ${({ selected }) => (selected ? "#eff6ff" : "#f8fafc")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
    background-color: #eff6ff;
  }
`;

export const CheckIndicator = styled("div")<{ selected?: boolean; type?: "single" | "multiple" }>`
  width: 20px;
  height: 20px;
  border-radius: ${({ type }) => (type === "multiple" ? "6px" : "50%")};
  border: 2px solid ${({ selected }) => (selected ? "#2563eb" : "#cbd5e1")};
  background-color: ${({ selected }) => (selected ? "#2563eb" : "#ffffff")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;

  &::after {
    content: "";
    display: ${({ selected }) => (selected ? "block" : "none")};
    width: ${({ type }) => (type === "multiple" ? "6px" : "8px")};
    height: ${({ type }) => (type === "multiple" ? "10px" : "8px")};
    border: solid #ffffff;
    border-width: ${({ type }) => (type === "multiple" ? "0 2px 2px 0" : "0")};
    background-color: ${({ type }) => (type === "multiple" ? "transparent" : "#ffffff")};
    border-radius: ${({ type }) => (type === "multiple" ? "0" : "50%")};
    transform: ${({ type }) => (type === "multiple" ? "rotate(45deg)" : "none")};
  }
`;

export const OptionText = styled("span")`
  font-size: 15px;
  font-weight: 500;
  color: #334155;
`;

/* Results Bar Styles */
export const ResultsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

export const ResultsHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const TotalVotesText = styled("div")`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ResultRow = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ResultInfo = styled("div")`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

export const ResultOptionText = styled("span")``;

export const ResultPercentageText = styled("span")`
  color: #2563eb;
`;

export const ProgressBarTrack = styled("div")`
  width: 100%;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

export const ProgressBarFill = styled("div")<{ percentage: number; isTop?: boolean }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${({ isTop }) =>
    isTop
      ? "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)"
      : "linear-gradient(90deg, #64748b 0%, #94a3b8 100%)"};
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const CardFooter = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "secondary" | "outline" }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  ${({ variant }) => {
    switch (variant) {
      case "outline":
        return `
          background-color: transparent;
          color: #2563eb;
          border: 1px solid #cbd5e1;
          &:hover { background-color: #eff6ff; border-color: #2563eb; }
        `;
      case "secondary":
        return `
          background-color: #f1f5f9;
          color: #475569;
          &:hover { background-color: #e2e8f0; }
        `;
      case "primary":
      default:
        return `
          background-color: #2563eb;
          color: #ffffff;
          &:hover { background-color: #1d4ed8; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
