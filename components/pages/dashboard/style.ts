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

export const TabCount = styled("span")<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 6px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "#fff" : "var(--ref-text-secondary)")};
`;

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
  padding: 32px 24px 64px 24px;
  overflow-x: hidden;

  @media (max-width: 640px) {
    padding: 20px 12px 40px 12px;
  }
`;

export const Container = styled("div")`
  max-width: 1100px;
  margin: 0 auto;
`;

export const Layout = styled("div")`
  display: flex;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const MainColumn = styled("div")`
  flex: 1;
  min-width: 0;
`;

export const Sidebar = styled("nav")`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 220px;
  flex-shrink: 0;
  background: var(--ref-bg);
  border-radius: 8px;
  padding: 4px;
  position: sticky;
  top: 24px;

  @media (max-width: 900px) {
    width: 100%;
    flex-direction: row;
    position: static;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const SidebarTab = styled("button")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  background-color: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  box-shadow: ${({ active }) => (active ? "0 1px 4px rgba(0,0,0,0.08)" : "none")};

  &:hover {
    color: var(--ref-text-primary);
  }

  @media (max-width: 900px) {
    flex: none;
    justify-content: center;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }
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

export const FilterBar = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 18px 22px 22px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

export const FilterBarHeader = styled("div")`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const FilterBarTitle = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const FilterCountBadge = styled("span")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
`;

export const FilterGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
  align-items: end;
`;

export const FilterGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const FilterLabel = styled("label")`
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SearchInputWrapper = styled("div")`
  position: relative;
  display: flex;
  align-items: center;

  & > svg {
    position: absolute;
    left: 12px;
    pointer-events: none;
    opacity: 0.7;
  }

  & > input {
    padding-left: 34px;
  }
`;

export const FilterActions = styled("div")`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;

  @media (max-width: 640px) {
    width: 100%;
    margin-left: 0;

    & > button {
      flex: 1;
      justify-content: center;
    }
  }
`;

export const StatsGrid = styled("div")<{ compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ compact }) => (compact ? "180px" : "240px")}, 1fr));
  gap: ${({ compact }) => (compact ? "14px" : "20px")};
  margin-bottom: 32px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled("div")<{ compact?: boolean }>`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: ${({ compact }) => (compact ? "14px 16px" : "20px 24px")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
  display: flex;
  align-items: center;
  gap: ${({ compact }) => (compact ? "12px" : "16px")};

  @media (max-width: 480px) {
    padding: ${({ compact }) => (compact ? "12px 14px" : "16px 18px")};
  }
`;

export const StatIcon = styled("div")<{ compact?: boolean }>`
  width: ${({ compact }) => (compact ? "36px" : "48px")};
  height: ${({ compact }) => (compact ? "36px" : "48px")};
  border-radius: ${({ compact }) => (compact ? "8px" : "10px")};
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ compact }) => (compact ? "16px" : "22px")};
`;

export const StatInfo = styled("div")``;

export const StatValue = styled("div")<{ compact?: boolean }>`
  font-size: ${({ compact }) => (compact ? "19px" : "24px")};
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

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const CardHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
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
  max-width:330px
`;

export const Badge = styled("span")<{ variant?: "single" | "multiple" | "date" | "active" | "inactive" | "pending" | "approved" | "rejected" | "pinned" }>`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${({ variant }) => {
    if (variant === "multiple") {
      return "background: var(--ref-warning-soft); color: #b45309;";
    }
    if (variant === "date") {
      return "background: var(--ref-bg-subtle); color: var(--ref-text-secondary); font-weight: 400;";
    }
    if (variant === "active" || variant === "approved") {
      return "background: var(--ref-success-soft); color: var(--ref-success);";
    }
    if (variant === "inactive" || variant === "rejected") {
      return "background: var(--ref-danger-soft); color: var(--ref-danger);";
    }
    if (variant === "pending") {
      return "background: var(--ref-warning-soft); color: #b45309;";
    }
    if (variant === "pinned") {
      return "background: var(--ref-danger-soft); color: var(--ref-danger);";
    }
    return "background: var(--ref-primary-soft); color: var(--ref-primary-hover);";
  }}
`;

export const RejectionReasonBox = styled("div")`
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--ref-danger-soft);
  border: 1px solid var(--ref-danger);
  color: var(--ref-danger);
  font-size: 13px;
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
  flex-wrap: wrap;

  @media (max-width: 640px) {
    & > button {
      flex: 1;
      justify-content: center;
    }
  }
`;

export const PaginationBar = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  max-width: 100%;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const PageButton = styled("button")`
 padding: 7px 10px 10px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--ref-border);
  background-color: var(--ref-bg-elevated);
  color: var(--ref-primary);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: var(--ref-primary-soft);
    border-color: var(--ref-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

export const PageNumbers = styled("div")`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
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

  @media (max-width: 480px) {
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    font-size: 13px;
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

  @media (max-width: 480px) {
    padding: 18px;
  }
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

export const FieldError = styled("span")`
  font-size: 12px;
  font-weight: 500;
  color: var(--ref-danger);
`;

export const CategoryCheckboxGrid = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const CategoryCheckboxItem = styled("label")<{ checked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${({ checked }) => (checked ? "var(--ref-primary)" : "var(--ref-border)")};
  background: ${({ checked }) => (checked ? "var(--ref-primary-soft)" : "var(--ref-bg-elevated)")};
  color: ${({ checked }) => (checked ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  input {
    accent-color: var(--ref-primary);
  }
`;

export const Input = styled("input")`
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: var(--ref-text-secondary);
    opacity: 0.8;
  }

  &:hover {
    border-color: var(--ref-primary);
  }

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px var(--ref-primary-soft);
  }
`;

export const Select = styled("select")`
  width: 100%;
  height: 40px;
  padding: 0 32px 0 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2365676B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--ref-primary);
  }

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px var(--ref-primary-soft);
  }
`;

export const Textarea = styled("textarea")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 90px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

// პროდუქტის ფორმის "რამდენიმე სურათი" ველი — თითო URL-ს თავისი მწკრივი აქვს
// (thumbnail-ი + input + წაშლის ღილაკი), ახალი მწკრივი AddImageButton-ით ემატება.
export const ImageList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ImageRow = styled("div")`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const ImageThumb = styled("div")`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-subtle);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ref-text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const AddImageButton = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: transparent;
  border: 1px dashed var(--ref-border);
  color: var(--ref-primary);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--ref-primary);
    background: var(--ref-primary-soft);
  }
`;

export const AnswerInputRow = styled("div")<{ dragging?: boolean }>`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: opacity 0.15s ease, background-color 0.15s ease;
  opacity: ${({ dragging }) => (dragging ? 0.4 : 1)};
  background-color: ${({ dragging }) => (dragging ? "var(--ref-bg-soft)" : "transparent")};
`;

export const DragHandle = styled("span")`
  display: flex;
  align-items: center;
  color: var(--ref-text-secondary);
  cursor: grab;
  touch-action: none;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
`;

export const ModalFooter = styled("div")`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--ref-border-soft);

  @media (max-width: 480px) {
    flex-direction: column-reverse;

    & > button {
      width: 100%;
      justify-content: center;
    }
  }
`;

export const ChartsGrid = styled("div")`
  display: grid;
  grid-template-columns:  1fr;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);

  @media (max-width: 480px) {
    padding: 16px 18px;
  }
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

/* Skeleton Loaders */
export const SkeletonPulse = styled("div")<{ width?: string; height?: string; radius?: string }>`
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height || "16px"};
  border-radius: ${({ radius }) => radius || "6px"};
  background: linear-gradient(90deg, var(--ref-bg-subtle) 25%, var(--ref-border-soft) 37%, var(--ref-bg-subtle) 63%);
  background-size: 400% 100%;
  animation: ref-skeleton-shine 1.4s ease infinite;

  @keyframes ref-skeleton-shine {
    0% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
  }
`;

export const SkeletonStatCard = styled(StatCard)`
  gap: 16px;
`;

export const SkeletonCard = styled(QuestionCard)`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SkeletonRow = styled("div")`
  display: flex;
  gap: 10px;
`;
