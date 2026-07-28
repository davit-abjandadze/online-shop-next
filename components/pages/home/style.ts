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

export const PaginationBar = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
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
  border-radius: 16px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px dashed #cbd5e1;
`;
