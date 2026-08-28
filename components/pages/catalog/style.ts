import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px 24px 64px 24px;

  @media (max-width: 640px) {
    padding: 16px 12px 40px 12px;
  }
`;

/* ---------- Breadcrumb ---------- */

export const Breadcrumb = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--ref-text-secondary);

  a {
    color: var(--ref-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--ref-primary);
    }
  }

  span:last-child {
    color: var(--ref-text-primary);
    font-weight: 600;
  }
`;

/* ---------- Page header — იგივე "card" ენა, რაც მთავარი გვერდის სექციებს
   (PromoBanner-ის მსგავსი bg-elevated ბარათი) ---------- */

export const PageHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  padding: 28px 32px;
  border-radius: 24px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  box-shadow: var(--ref-shadow-sm);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
  }
`;

export const PageTitle = styled("h1")`
  margin: 0 0 6px 0;
  font-weight: 400;
  font-size: 32px;
  color: var(--ref-text-primary);

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

export const PageSubtitle = styled("p")`
  margin: 0;
  font-size: 14px;
  color: var(--ref-text-secondary);
`;

export const ResultsCount = styled("span")`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ref-primary);
  background: var(--ref-primary-soft);
  padding: 8px 16px;
  border-radius: 999px;
  white-space: nowrap;
`;

/* ---------- Layout — გვერდითი კატეგორიის პანელი + კონტენტი, იმავე
   პრინციპით რაც HeroFilterPanel/HeroSliderArea მთავარ გვერდზე ---------- */

export const Layout = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 24px;
`;

export const Sidebar = styled("aside")`
  flex-shrink: 0;
  width: 268px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const SidebarCard = styled("div")`
  border-radius: 20px;
  background: var(--ref-bg-elevated);
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid var(--ref-border-soft);
  overflow: hidden;
`;

export const SidebarCardTitle = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const SidebarCardBody = styled("div")`
  padding: 8px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 420px;
  overflow-y: auto;
`;

export const CategoryOption = styled("button")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: 10px;
  background: ${({ active }) => (active ? "var(--ref-primary-soft)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--ref-primary-soft);
    color: var(--ref-primary);
  }
`;

// root კატეგორიის ქვეშ ჩამონათვალი ქვეკატეგორიებისთვის — შეწერილი ტირით,
// შემცირებული ზომით და დამატებითი left padding-ით იერარქიის საჩვენებლად.
export const SubcategoryOption = styled(CategoryOption)`
  padding-left: 28px;
  font-size: 12.5px;
`;

export const CategoryOptionLabel = styled("span")`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FilterEmpty = styled("span")`
  display: block;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--ref-text-secondary);
`;

export const Main = styled("div")`
  flex: 1;
  min-width: 0;
`;

/* ---------- Toolbar — შედეგების რაოდენობა + დალაგება, "ბარათის" სახით ---------- */

export const Toolbar = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
`;

export const MobileCategorySelect = styled("div")`
  display: none;
  align-items: center;
  gap: 8px;

  @media (max-width: 900px) {
    display: flex;
  }
`;

export const SortWrap = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

export const SortLabel = styled("span")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  white-space: nowrap;
`;

export const ToolbarCount = styled("span")`
  font-size: 13px;
  color: var(--ref-text-secondary);

  strong {
    color: var(--ref-text-primary);
    font-weight: 700;
  }
`;

/* ---------- Products grid (მთავარი გვერდის იმავე ბარათის ფორმა) ---------- */

export const ProductsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonCard = styled("div")`
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-bg-elevated);
`;

export const SkeletonBlock = styled("div")<{ height?: string }>`
  height: ${({ height }) => height || "18px"};
  background: linear-gradient(90deg, var(--ref-bg) 25%, var(--ref-border-soft) 50%, var(--ref-bg) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const EmptyState = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
  border-radius: 20px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
`;

export const EmptyStateTitle = styled("h3")`
  margin: 0;
  font-size: 18px;
  color: var(--ref-text-primary);
`;

/* ---------- Pagination — მთავარი გვერდის primary/pill ენით ---------- */

export const PaginationBar = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
`;

export const PageButton = styled("button")`
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--ref-primary);
    color: var(--ref-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PageNumbers = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PageNumberButton = styled("button")<{ active?: boolean }>`
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  background: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "#fff" : "var(--ref-text-primary)")};
  font-weight: ${({ active }) => (active ? 700 : 500)};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--ref-primary);
  }
`;
