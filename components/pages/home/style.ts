import styled from "styled-components";

export const FilterBar = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
`;

export const FilterChip = styled("button")<{ active?: boolean }>`
  padding: 6px 16px;
  border-radius: 999px;
  border: 2px solid ${({ active }) => (active ? "#2563eb" : "#e2e8f0")};
  background-color: ${({ active }) => (active ? "#2563eb" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#475569")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
    color: ${({ active }) => (active ? "#ffffff" : "#2563eb")};
  }
`;

export const HeroSection = styled("section")`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 64px 24px;
  text-align: center;
  margin-bottom: 40px;
`;

export const HeroTitle = styled("h1")`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 640px) {
    font-size: 28px;
  }
`;

export const HeroSubtitle = styled("p")`
  font-size: 16px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

export const Container = styled("div")`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 64px 24px;
`;

export const SectionHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const SectionTitle = styled("h2")`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const QuestionsGrid = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const QuestionCard = styled("div")`
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

export const QuestionText = styled("h3")`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const Badge = styled("span")<{ variant?: "single" | "multiple" }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ variant }) => (variant === "multiple" ? "#fef3c7" : "#dbeafe")};
  color: ${({ variant }) => (variant === "multiple" ? "#b45309" : "#1d4ed8")};
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

export const EmptyState = styled("div")`
  background: #ffffff;
  border-radius: 16px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px dashed #cbd5e1;
`;
