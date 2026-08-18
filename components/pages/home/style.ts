import styled from "styled-components";

export const FilterBar = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 28px;
  max-width: 100%;
`;

export const FilterChips = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SortControl = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
`;

export const SortLabel = styled("span")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  white-space: nowrap;
`;

export const SortSelect = styled("select")`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 6px 30px 6px 14px;
  border-radius: 999px;
  border: 2px solid var(--ref-border-soft);
  background-color: var(--ref-bg-elevated);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2365676b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  color: var(--ref-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover,
  &:focus {
    border-color: var(--ref-primary);
    color: var(--ref-primary);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234238a9' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  :root[data-theme="dark"] & {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23b0b3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");

    &:hover,
    &:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23685cec' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    }
  }
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

/* Hero: სპეციალურად მუქი, "ციფრული" გრადიენტიანი ზოლი — ფიქსირებული, არ
   ეყრდნობა light/dark თემის toggle-ს, ისევე როგორც სქემის დანარჩენი
   ნაწილები. ეს გამოყოფს hero-ს, როგორც პლატფორმის "ვიტრინას". */
export const HeroSection = styled("section")`
  position: relative;
  overflow: hidden;
  width: 100%;
  background: radial-gradient(120% 140% at 15% -10%, #1e3a8a 0%, #0f1f4d 46%, #0a1533 100%);
`;

export const HeroTexture = styled("div")`
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(ellipse 70% 60% at 30% 20%, black 40%, transparent 100%);
  pointer-events: none;
`;

export const HeroGlow = styled("div")<{ variant?: "blue" | "gold" }>`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  ${({ variant }) =>
    variant === "gold"
      ? `
    bottom: -180px;
    left: 10%;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(250, 212, 0, 0.14) 0%, rgba(250, 212, 0, 0) 70%);
  `
      : `
    top: -140px;
    right: -120px;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(66, 147, 250, 0.35) 0%, rgba(66, 147, 250, 0) 70%);
  `}
`;

export const HeroInner = styled("div")`
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 72px 24px 48px 24px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 48px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 40px 20px 32px 20px;
    gap: 32px;
  }
`;

export const HeroContent = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 900px) {
     gap: 10px;
  }
`;

export const HeroEyebrow = styled("div")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  width: fit-content;
  font-size: 13px;
  font-weight: 700;
  color: #e7f0ff;

   @media (max-width: 900px) {
    display: none;
  }
`;

export const HeroTitle = styled("h1")`
  font-size: 44px;
  line-height: 1.12;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.8px;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

export const HeroTitleAccent = styled("span")`
  background: linear-gradient(90deg, #8bb8ff 0%, var(--ref-accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export const HeroSubtitle = styled("p")`
  font-size: 16px;
  color: rgba(230, 236, 250, 0.78);
  max-width: 460px;
  margin: 0;
  line-height: 1.6;
  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

export const HeroButtonRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

export const HeroCTAButton = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 22px;
  border-radius: 10px;
  border: none;
  background: var(--ref-accent);
  color: #3a2e00;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(250, 212, 0, 0.22);
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: var(--ref-accent-hover, #e6c000);
    transform: translateY(-1px);
  }

   @media (max-width: 900px) {
      height: 38px;
  font-size: 13px;

  }
`;

export const HeroSecondaryButton = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
  color: #ffffff!important;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
  }

   @media (max-width: 900px) {
      height: 38px;
  font-size: 13px;

  }
`;

export const HeroTrustRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
    @media (max-width: 900px) {
      border-top: none;
       margin-top: 0;
  padding-top: 0;

  }
`;

export const HeroTrustItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(230, 236, 250, 0.85);
`;

/* Hero illustration: abstract ballot / data-viz motif — deliberately not
   a literal hand or hologram (see design discussion) */
export const HeroVisual = styled("div")`
  position: relative;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    height: 260px;
    display: none;
  }
`;

export const HeroVisualBlob = styled("div")`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.14);

  @media (max-width: 900px) {
    width: 240px;
    height: 240px;
  }
`;

export const HeroFloatingCard = styled("div")`
  position: absolute;
  top: 6px;
  right: -4px;
  width: 140px;
  background: rgba(20, 32, 72, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--ref-shadow-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const HeroFloatingBadge = styled("div")`
  position: absolute;
  bottom: 14px;
  left: -14px;
  display: flex;
  align-items: center;
  gap: 9px;
  background: #ffffff;
  border-radius: 999px;
  box-shadow: var(--ref-shadow-lg);
  padding: 10px 16px 10px 10px;

  @media (max-width: 900px) {
    left: 4px;
  }
`;

export const HeroStatsStrip = styled("div")`
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

export const HeroStatsInner = styled("div")`
  max-width: 1280px;
  margin: 0 auto;
  padding: 22px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const HeroStatItem = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const HeroStatValue = styled("span")`
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.4px;
`;

export const HeroStatLabel = styled("span")`
  font-size: 12px;
  font-weight: 600;
  color: rgba(230, 236, 250, 0.6);
`;

export const PopularSection = styled("section")`
  max-width: 960px;
  margin: 0 auto 24px auto;
  padding: 0 16px;
  margin-top: 15px;

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
  padding: 7px 10px 10px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
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

export const skeletonShimmer = `
  @keyframes ref-skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const SkeletonBlock = styled("div")<{ width?: string; height?: string }>`
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height || "14px"};
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--ref-border-soft) 25%,
    var(--ref-border) 50%,
    var(--ref-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: ref-skeleton-shimmer 1.4s ease-in-out infinite;

  ${skeletonShimmer}
`;

export const SkeletonCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 10px;
  padding: 20px;
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid var(--ref-border);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SkeletonCardHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SkeletonOptions = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SkeletonFooter = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
`;

export const PageBackground = styled("div")`
  background: var(--ref-bg);
  min-height: 100vh;
  transition: background 0.2s ease;
`;
