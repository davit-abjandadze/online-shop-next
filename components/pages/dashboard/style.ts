import styled from "styled-components";

export const TabBar = styled("div")`
  display: flex;
  gap: 4px;
  background: var(--ref-bg);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 28px;
`;

export const Tab = styled("button")<{ active?: boolean }>`
  flex: 1;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  box-shadow: ${({ active }) => (active ? "0 1px 4px rgba(0,0,0,0.08)" : "none")};

  &:hover {
    color: var(--ref-text-primary);
  }
`;

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
  padding: 32px 24px 64px 24px;
`;

export const Container = styled("div")`
  max-width: 1100px;
  margin: 0 auto;
`;

export const HeaderSection = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TitleGroup = styled("div")``;

export const PageTitle = styled("h1")`
  font-size: 26px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PageSubtitle = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0;
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "danger" | "secondary" | "outline" | "success" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ variant }) => {
    switch (variant) {
      case "danger":
        return `
          background-color: var(--ref-danger);
          color: var(--ref-text-on-primary);
          &:hover { background-color: var(--ref-danger); }
        `;
      case "secondary":
        return `
          background-color: var(--ref-bg-subtle);
          color: var(--ref-text-primary);
          &:hover { background-color: var(--ref-border-soft); }
        `;
      case "success":
        return `
          background-color: var(--ref-success);
          color: var(--ref-text-on-primary);
          &:hover { background-color: var(--ref-success); }
        `;
      case "outline":
        return `
          background-color: transparent;
          color: var(--ref-primary);
          border: 1px solid var(--ref-border);
          &:hover { background-color: var(--ref-primary-soft); border-color: var(--ref-primary); }
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

export const StatsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatIcon = styled("div")`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
`;

export const StatInfo = styled("div")``;

export const StatValue = styled("div")`
  font-size: 24px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const StatLabel = styled("div")`
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

export const QuestionsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const QuestionCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

export const CardHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

export const QuestionText = styled("h3")`
  font-size: 18px;
  font-weight: 600;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const BadgeGroup = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Badge = styled("span")<{ variant?: "single" | "multiple" | "date" | "active" | "inactive" }>`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;

  ${({ variant }) => {
    if (variant === "multiple") {
      return "background: var(--ref-warning-soft); color: #b45309;";
    }
    if (variant === "date") {
      return "background: var(--ref-bg-subtle); color: var(--ref-text-secondary); font-weight: 400;";
    }
    if (variant === "active") {
      return "background: var(--ref-success-soft); color: var(--ref-success);";
    }
    if (variant === "inactive") {
      return "background: var(--ref-danger-soft); color: var(--ref-danger);";
    }
    return "background: var(--ref-primary-soft); color: var(--ref-primary-hover);";
  }}
`;

export const AnswersSection = styled("div")`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const AnswersTitle = styled("div")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

export const AnswersGrid = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const AnswerPill = styled("div")`
  background: var(--ref-bg-subtle);
  border: 1px solid var(--ref-border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  color: var(--ref-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardActions = styled("div")`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const PaginationBar = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const PageButton = styled("button")`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--ref-border);
  background-color: var(--ref-bg-elevated);
  color: var(--ref-primary);

  &:hover:not(:disabled) {
    background-color: var(--ref-primary-soft);
    border-color: var(--ref-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageNumbers = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PageNumberButton = styled("button")<{ active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border)")};
  background-color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "var(--ref-text-primary)")};

  &:hover:not(:disabled) {
    ${({ active }) => (active ? "" : "background-color: var(--ref-primary-soft); border-color: var(--ref-primary);")}
  }
`;

export const PageEllipsis = styled("span")`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ref-text-secondary);
  font-weight: 600;
`;

export const EmptyState = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed var(--ref-border);
`;

export const EmptyTitle = styled("h3")`
  font-size: 18px;
  font-weight: 600;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
`;

export const EmptyText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 20px 0;
`;

/* Modal Styles */
export const ModalOverlay = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--ref-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 28px;
`;

export const ModalHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const ModalTitle = styled("h2")`
  font-size: 20px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
`;

export const CloseButton = styled("button")`
  background: transparent;
  border: none;
  font-size: 22px;
  color: var(--ref-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: var(--ref-bg-subtle);
    color: var(--ref-text-primary);
  }
`;

export const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

export const Label = styled("label")`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const Input = styled("input")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

export const Select = styled("select")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  background: var(--ref-bg-elevated);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
  }
`;

export const AnswerInputRow = styled("div")`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ModalFooter = styled("div")`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const ChartsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const ChartCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
`;

export const ChartCardTitle = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const ChartTitleText = styled("h3")`
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
`;

export const ChartCanvasWrapper = styled("div")`
  position: relative;
  height: 280px;
`;

export const PeriodSelector = styled("div")`
  display: flex;
  gap: 4px;
  background: var(--ref-bg);
  border-radius: 8px;
  padding: 3px;
`;

export const PeriodButton = styled("button")<{ active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  box-shadow: ${({ active }) => (active ? "0 1px 4px rgba(0,0,0,0.08)" : "none")};
`;

export const PopularQuestionsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PopularQuestionRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--ref-bg-subtle);
  border: 1px solid var(--ref-border-soft);
  border-radius: 10px;
`;

export const PopularRank = styled("div")`
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PopularQuestionInfo = styled("div")`
  flex: 1;
  min-width: 0;
`;

export const PopularQuestionText = styled("div")`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PopularQuestionMeta = styled("div")`
  font-size: 12px;
  color: var(--ref-text-secondary);
`;

export const PopularQuestionVotes = styled("div")`
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-primary);
  white-space: nowrap;
`;

export const AccessDeniedCard = styled("div")`
  max-width: 480px;
  margin: 100px auto 0 auto;
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

export const AccessDeniedTitle = styled("h2")`
  font-size: 22px;
  font-weight: 700;
  color: var(--ref-danger);
  margin: 16px 0 8px 0;
`;

export const AccessDeniedText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 24px 0;
`;
