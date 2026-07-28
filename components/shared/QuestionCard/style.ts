import styled from "styled-components";

export const QuestionCardWrapper = styled("div")`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  border: 1px solid #CED0D4;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  }
`;

export const CardTop = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
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
  color: ${({ active }) => (active ? "#f59e0b" : "#8A8D91")};
  transition: all 0.2s ease;

  &:hover {
    background-color: #F0F2F5;
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
  color: #050505;
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
        return "background: #F0F2F5; color: #65676B;";
      default:
        return "background: #E7F3FF; color: #166FE5;";
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
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid ${({ selected }) => (selected ? "#1877F2" : "#CED0D4")};
  background-color: ${({ selected }) => (selected ? "#E7F3FF" : "#F7F8FA")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #1877F2;
    background-color: #E7F3FF;
  }
`;

export const CheckIndicator = styled("div")<{ selected?: boolean; type?: "single" | "multiple" }>`
  width: 20px;
  height: 20px;
  border-radius: ${({ type }) => (type === "multiple" ? "6px" : "50%")};
  border: 2px solid ${({ selected }) => (selected ? "#1877F2" : "#CED0D4")};
  background-color: ${({ selected }) => (selected ? "#1877F2" : "#ffffff")};
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
  color: #050505;
`;

/* Results Bar Styles */
export const ResultsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  background: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E4E6EB;
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
  color: #65676B;
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
  color: #050505;
`;

export const ResultOptionText = styled("span")``;

export const ResultPercentageText = styled("span")`
  color: #1877F2;
`;

export const ProgressBarTrack = styled("div")`
  width: 100%;
  height: 12px;
  background-color: #E4E6EB;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

export const ProgressBarFill = styled("div")<{ percentage: number; isTop?: boolean }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${({ isTop }) =>
    isTop
      ? "linear-gradient(90deg, #1877F2 0%, #1877F2 100%)"
      : "linear-gradient(90deg, #65676B 0%, #8A8D91 100%)"};
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const CardFooter = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid #E4E6EB;
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "secondary" | "outline" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  ${({ variant }) => {
    switch (variant) {
      case "outline":
        return `
          background-color: transparent;
          color: #65676B;
          &:hover { background-color: #F0F2F5; }
        `;
      case "secondary":
        return `
          background-color: transparent;
          color: #65676B;
          &:hover { background-color: #F0F2F5; }
        `;
      case "primary":
      default:
        return `
          background-color: #1877F2;
          color: #ffffff;
          &:hover { background-color: #166FE5; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
