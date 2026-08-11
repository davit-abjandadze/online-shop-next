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
  border: 2px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  background-color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "var(--ref-text-on-primary)" : "var(--ref-text-secondary)")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: var(--ref-primary);
    color: ${({ active }) => (active ? "var(--ref-text-on-primary)" : "var(--ref-primary)")};
  }
`;

export const HeroSection = styled("section")`
  background: linear-gradient(135deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%);
  color: var(--ref-text-on-primary);
  padding: 44px 24px;
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--ref-border-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const HeroTitle = styled("h1")`
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: var(--ref-text-on-primary);
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

export const HeroSubtitle = styled("p")`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

export const PopularSection = styled("section")`
  max-width: 960px;
  margin: 0 auto 24px auto;
  padding: 0 16px;

  .swiper {
    /* ზედა padding საკმარისი უნდა იყოს PopularTrendingTag ბეიჯის
       (top: -10px) და hover-ზე ბარათის translateY(-4px) აწევის
       დასატევად, თორემ overflow: hidden კონტეინერი ჭრის მას */
    padding: 20px 4px 38px 4px;
  }

  .swiper-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    bottom: 0 !important;
  }

  .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    margin: 0 !important;
    background: var(--ref-border);
    border-radius: 999px;
    opacity: 1;
    transition: width 0.25s ease, background-color 0.25s ease;
  }

  .swiper-pagination-bullet-active {
    width: 22px;
    background: var(--ref-primary);
  }

  .swiper-button-next,
  .swiper-button-prev {
    display: none;
  }
`;

export const PopularSectionHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const PopularSectionTitle = styled("h2")`
  font-size: 20px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PopularNavButtons = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PopularNavButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  color: var(--ref-primary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--ref-primary);
    border-color: var(--ref-primary);
    color: var(--ref-text-on-primary);
  }

  &:disabled,
  &.swiper-button-disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const PopularCard = styled("div")<{ rank?: number }>`
  position: relative;
  background: var(--ref-bg-elevated);
  border-radius: 12px;
  padding: 18px 16px 16px 16px;
  height: 100%;
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid ${({ rank }) => (rank === 1 ? "var(--ref-primary)" : "var(--ref-border)")};
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--ref-shadow-md);
    border-color: var(--ref-primary);
  }
`;

export const PopularTrendingTag = styled("div")`
  position: absolute;
  top: -10px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f43e50 0%, #ff7a59 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(244, 62, 80, 0.35);
`;

export const PopularCardTop = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const rankGradients: Record<number, string> = {
  1: "linear-gradient(135deg, #FFD76A 0%, #F5A623 100%)",
  2: "linear-gradient(135deg, #E3E7EC 0%, #B7BEC7 100%)",
  3: "linear-gradient(135deg, #E7B27A 0%, #C1743A 100%)",
};

export const PopularRankBadge = styled("div")<{ rank?: number }>`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${({ rank }) => (rank && rankGradients[rank]) || "var(--ref-primary)"};
  color: ${({ rank }) => (rank && rank <= 3 ? "#5a3d00" : "var(--ref-text-on-primary)")};
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px var(--ref-bg-elevated), 0 2px 6px rgba(0, 0, 0, 0.15);
`;

export const PopularCardText = styled("div")`
  font-size: 15px;
  font-weight: 600;
  color: var(--ref-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PopularVoteBarTrack = styled("div")`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--ref-border-soft);
  overflow: hidden;
`;

export const PopularVoteBarFill = styled("div")<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.max(4, Math.min(100, percent))}%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%);
  transition: width 0.4s ease;
`;

export const PopularCardFooter = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const PopularVotesBadge = styled("div")`
  font-size: 13px;
  font-weight: 700;
  color: var(--ref-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PopularCategoryLabel = styled("span")`
  font-size: 12px;
  color: var(--ref-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Container = styled("div")`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px 64px 16px;
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
  color: var(--ref-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const QuestionsGrid = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  color: ${({ active }) => (active ? "var(--ref-text-on-primary)" : "var(--ref-text-primary)")};

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
  border-radius: 10px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid var(--ref-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const EmptyStateTitle = styled("h3")`
  font-size: 18px;
  color: var(--ref-text-primary);
  margin: 8px 0 0 0;
`;

export const EmptyStateText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0;
`;

export const PopularModalOverlay = styled("div")`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  z-index: 1000;
`;

export const PopularModalBox = styled("div")`
  position: relative;
  width: 100%;
  max-width: 560px;
`;

export const PopularModalContent = styled("div")`
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--ref-bg);
  border-radius: 14px;
  box-shadow: var(--ref-shadow-md);
`;

export const PopularModalClose = styled("button")`
  /* გატანილია გვერდზე, ბოქსის გარეთ, 15px დაშორებით */
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(calc(100% + 15px));
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.15s ease;

  &:hover {
    background: var(--ref-primary);
    border-color: var(--ref-primary);
    color: var(--ref-text-on-primary);
  }
`;

export const PageBackground = styled("div")`
  background: var(--ref-bg);
  min-height: 100vh;
  transition: background 0.2s ease;
`;
