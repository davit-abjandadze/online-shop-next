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
  border: 2px solid ${({ active }) => (active ? "#1877F2" : "#E4E6EB")};
  background-color: ${({ active }) => (active ? "#1877F2" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#65676B")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1877F2;
    color: ${({ active }) => (active ? "#ffffff" : "#1877F2")};
  }
`;

export const HeroSection = styled("section")`
  background: #1877F2;
  color: #ffffff;
  padding: 40px 24px;
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #E4E6EB;
`;

export const HeroTitle = styled("h1")`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #ffffff;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

export const HeroSubtitle = styled("p")`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

export const PopularSection = styled("section")`
  max-width: 900px;
  margin: 0 auto 24px auto;
  padding: 0 16px;

  .swiper {
    padding: 4px 4px 44px 4px;
  }

  .swiper-pagination-bullet {
    background: #CED0D4;
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    background: #1877F2;
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: #1877F2;
    background: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &::after {
      font-size: 14px;
      font-weight: 700;
    }
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
  color: #050505;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PopularCard = styled("div")`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  border: 1px solid #CED0D4;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  }
`;

export const PopularCardTop = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const PopularRankBadge = styled("div")`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1877F2;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PopularCardText = styled("div")`
  font-size: 15px;
  font-weight: 600;
  color: #050505;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PopularCardFooter = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #F0F2F5;
`;

export const PopularVotesBadge = styled("div")`
  font-size: 13px;
  font-weight: 700;
  color: #1877F2;
  display: flex;
  align-items: center;
  gap: 6px;
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
  color: #050505;
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
  border: 1px solid #CED0D4;
  background-color: #ffffff;
  color: #1877F2;

  &:hover:not(:disabled) {
    background-color: #E7F3FF;
    border-color: #1877F2;
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
  border: 1px solid ${({ active }) => (active ? "#1877F2" : "#CED0D4")};
  background-color: ${({ active }) => (active ? "#1877F2" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#050505")};

  &:hover:not(:disabled) {
    ${({ active }) => (active ? "" : "background-color: #E7F3FF; border-color: #1877F2;")}
  }
`;

export const PageEllipsis = styled("span")`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8A8D91;
  font-weight: 600;
`;

export const EmptyState = styled("div")`
  background: #ffffff;
  border-radius: 8px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  border: 1px solid #CED0D4;
`;
