import styled from "styled-components";

export const QuestionCardWrapper = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 10px;
  padding: 16px;
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid var(--ref-border);
  transition: box-shadow 0.15s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: var(--ref-shadow-md);
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ref-bg-subtle);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CardTopActions = styled("div")`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const ShareButton = styled("button")`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ref-bg-subtle);
  }
`;

export const QuestionText = styled("h3")`
  font-size: 20px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const Badge = styled("span")<{ variant?: "single" | "multiple" | "countdown" | "expired" | "category" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 6px;

  ${({ variant }) => {
    switch (variant) {
      case "multiple":
        return "background: var(--ref-warning-soft); color: #b45309;";
      case "countdown":
        return "background: var(--ref-warning-soft); color: #c2410c;";
      case "expired":
        return "background: var(--ref-danger-soft); color: var(--ref-danger);";
      case "category":
        return "background: var(--ref-bg-subtle); color: var(--ref-text-secondary);";
      default:
        return "background: var(--ref-primary-soft); color: var(--ref-primary);";
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
  border-radius: 8px;
  border: 1px solid ${({ selected }) => (selected ? "var(--ref-primary)" : "var(--ref-border)")};
  background-color: ${({ selected }) => (selected ? "var(--ref-primary-soft)" : "var(--ref-bg-subtle)")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--ref-primary);
    background-color: var(--ref-primary-soft);
  }
`;

export const OptionText = styled("span")`
  font-size: 15px;
  font-weight: 500;
  color: var(--ref-text-primary);
`;

/* Results Bar Styles */
export const ResultsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  background: var(--ref-bg-subtle);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid var(--ref-border-soft);
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
  color: var(--ref-text-secondary);
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
  color: var(--ref-text-primary);
`;

export const ResultOptionText = styled("span")``;

export const ResultPercentageText = styled("span")`
  color: var(--ref-primary);
`;

export const ProgressBarTrack = styled("div")`
  width: 100%;
  height: 12px;
  background-color: var(--ref-border-soft);
  border-radius: 6px;
  overflow: hidden;
  position: relative;

  html[data-theme="dark"] & {
       background-color: #edf4fb;
  }
`;

export const ProgressBarFill = styled("div")<{ percentage: number; isTop?: boolean }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${({ isTop }) =>
    isTop
      ? "linear-gradient(90deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%)"
      : "linear-gradient(90deg, var(--ref-text-secondary) 0%, var(--ref-text-disabled) 100%)"};
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

/* Demographics Breakdown (სქესი/ასაკი) */
export const DemographicsWrapper = styled("div")<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: ${({ compact }) => (compact ? "10px" : "0")};
  padding-top: ${({ compact }) => (compact ? "10px" : "0")};
  border-top: ${({ compact }) => (compact ? "1px dashed var(--ref-border-soft)" : "none")};
`;

export const DemographicsTitle = styled("div")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
`;

export const DemographicsToggle = styled("button")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--ref-text-primary);
  }
`;

export const GenderStackTrack = styled("div")`
  display: flex;
  width: 100%;
  height: 10px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--ref-border-soft);
`;

export const GenderStackSegment = styled("div")<{ color: string }>`
  height: 100%;
  background-color: ${({ color }) => color};

  & + & {
    margin-left: 2px;
  }
`;

export const GenderLegend = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const GenderLegendItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ref-text-secondary);
`;

export const GenderLegendDot = styled("span")<{ color: string }>`
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

export const AgeGroupList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const AgeGroupRow = styled("div")`
  display: grid;
  grid-template-columns: 48px 1fr 28px;
  align-items: center;
  gap: 8px;
`;

export const AgeGroupLabel = styled("span")`
  font-size: 11px;
  color: var(--ref-text-secondary);
`;

export const AgeGroupBarTrack = styled("div")`
  height: 6px;
  border-radius: 4px;
  background: var(--ref-border-soft);
  overflow: hidden;
`;

export const AgeGroupBarFill = styled("div")`
  height: 100%;
  background: var(--ref-primary);
  border-radius: 4px;
  transition: width 0.4s ease;
`;

export const AgeGroupCount = styled("span")`
  font-size: 11px;
  font-weight: 600;
  color: var(--ref-text-primary);
  text-align: right;
`;

export const DemographicsEmptyText = styled("div")`
  font-size: 12px;
  color: var(--ref-text-secondary);
`;

export const CardFooter = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "secondary" | "outline" }>`
  padding: 8px 16px;
  border-radius: 8px;
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
          color: var(--ref-text-secondary);
          &:hover { background-color: var(--ref-bg-subtle); }
        `;
      case "secondary":
        return `
          background-color: transparent;
          color: var(--ref-text-secondary);
          &:hover { background-color: var(--ref-bg-subtle); }
        `;
      case "primary":
      default:
        return `
          background-color: var(--ref-primary);
          color: var(--ref-text-on-primary);
          &:hover { background-color: var(--ref-primary-hover); }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
