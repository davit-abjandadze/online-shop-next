import styled from "styled-components";

export const TabBar = styled("div")`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 12px;
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
  background-color: ${({ active }) => (active ? "#ffffff" : "transparent")};
  color: ${({ active }) => (active ? "#0f172a" : "#64748b")};
  box-shadow: ${({ active }) => (active ? "0 1px 4px rgba(0,0,0,0.08)" : "none")};

  &:hover {
    color: #0f172a;
  }
`;

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: #f8fafc;
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
  color: #0f172a;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PageSubtitle = styled("p")`
  font-size: 14px;
  color: #64748b;
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
          background-color: #ef4444;
          color: #ffffff;
          &:hover { background-color: #dc2626; }
        `;
      case "secondary":
        return `
          background-color: #f1f5f9;
          color: #334155;
          &:hover { background-color: #e2e8f0; }
        `;
      case "success":
        return `
          background-color: #16a34a;
          color: #ffffff;
          &:hover { background-color: #15803d; }
        `;
      case "outline":
        return `
          background-color: transparent;
          color: #2563eb;
          border: 1px solid #cbd5e1;
          &:hover { background-color: #eff6ff; border-color: #2563eb; }
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

export const StatsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled("div")`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatIcon = styled("div")`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
`;

export const StatInfo = styled("div")``;

export const StatValue = styled("div")`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
`;

export const StatLabel = styled("div")`
  font-size: 13px;
  color: #64748b;
`;

export const QuestionsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const QuestionCard = styled("div")`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
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
  color: #0f172a;
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
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  ${({ variant }) => {
    if (variant === "multiple") {
      return "background: #fef3c7; color: #b45309;";
    }
    if (variant === "date") {
      return "background: #f1f5f9; color: #64748b; font-weight: 400;";
    }
    if (variant === "active") {
      return "background: #dcfce7; color: #16a34a;";
    }
    if (variant === "inactive") {
      return "background: #fee2e2; color: #dc2626;";
    }
    return "background: #dbeafe; color: #1d4ed8;";
  }}
`;

export const AnswersSection = styled("div")`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

export const AnswersTitle = styled("div")`
  font-size: 13px;
  font-weight: 600;
  color: #475569;
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
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  color: #334155;
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
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #2563eb;

  &:hover:not(:disabled) {
    background-color: #eff6ff;
    border-color: #2563eb;
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
  border: 1px solid ${({ active }) => (active ? "#2563eb" : "#cbd5e1")};
  background-color: ${({ active }) => (active ? "#2563eb" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#334155")};

  &:hover:not(:disabled) {
    ${({ active }) => (active ? "" : "background-color: #eff6ff; border-color: #2563eb;")}
  }
`;

export const PageEllipsis = styled("span")`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-weight: 600;
`;

export const EmptyState = styled("div")`
  background: #ffffff;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed #cbd5e1;
`;

export const EmptyTitle = styled("h3")`
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
`;

export const EmptyText = styled("p")`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
`;

/* Modal Styles */
export const ModalOverlay = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled("div")`
  background: #ffffff;
  border-radius: 16px;
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
  border-bottom: 1px solid #f1f5f9;
`;

export const ModalTitle = styled("h2")`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

export const CloseButton = styled("button")`
  background: transparent;
  border: none;
  font-size: 22px;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
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
  color: #334155;
`;

export const Input = styled("input")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

export const Select = styled("select")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  outline: none;
  background: #ffffff;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #2563eb;
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
  border-top: 1px solid #f1f5f9;
`;

export const ChartsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const ChartCard = styled("div")`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
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
  color: #0f172a;
  margin: 0;
`;

export const ChartCanvasWrapper = styled("div")`
  position: relative;
  height: 280px;
`;

export const PeriodSelector = styled("div")`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
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
  background-color: ${({ active }) => (active ? "#ffffff" : "transparent")};
  color: ${({ active }) => (active ? "#0f172a" : "#64748b")};
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
`;

export const PopularRank = styled("div")`
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
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
  color: #0f172a;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PopularQuestionMeta = styled("div")`
  font-size: 12px;
  color: #64748b;
`;

export const PopularQuestionVotes = styled("div")`
  font-size: 15px;
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;
`;

export const AccessDeniedCard = styled("div")`
  max-width: 480px;
  margin: 100px auto 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

export const AccessDeniedTitle = styled("h2")`
  font-size: 22px;
  font-weight: 700;
  color: #ef4444;
  margin: 16px 0 8px 0;
`;

export const AccessDeniedText = styled("p")`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
`;
