import styled from "styled-components";

export const Card = styled("a")<{ out?: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(--ref-bg-elevated);
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--ref-shadow-sm);
  opacity: ${({ out }) => (out ? 0.55 : 1)};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: var(--ref-shadow-md);
  }
`;

export const ImageWrap = styled("div")`
  position: relative;
  width: calc(100% - 20px);
  height:250px;
  margin: 10px;
  border-radius: 14px;
  background: var(--ref-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--ref-text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DiscountBadge = styled("span")`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: var(--ref-danger);
`;

export const WishlistToggle = styled("button")<{ active?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  color: ${({ active }) => (active ? "var(--ref-danger)" : "var(--ref-text-secondary)")};
  box-shadow: var(--ref-shadow-sm);
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;

  &:hover {
    transform: scale(1.08);
    color: var(--ref-danger);
  }
`;

export const Body = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 14px 14px;
  flex: 1;
`;

export const Name = styled("h3")`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height:37px;
`;

export const ColorStockBadge = styled("div")`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  width: fit-content;
  max-width: 100%;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--ref-bg);
`;

export const ColorStockItem = styled("span")`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--ref-text-secondary);
`;

export const ColorDot = styled("span")<{ hexCode?: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ hexCode }) => hexCode || "#ccc"};
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const Footer = styled("div")`
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const PriceGroup = styled("div")`
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
  flex-direction: column;

`;

export const Price = styled("span")`
  font-size: 16px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const OldPrice = styled("span")`
  font-size: 12px;
  color: var(--ref-text-secondary);
  text-decoration: line-through;
  text-decoration-color: red;
`;

export const AddButton = styled("button")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ active }) => (active ? "6px" : "0")};
  max-width: ${({ active }) => (active ? "120px" : "34px")};
  height: 34px;
  min-width: 34px;
  padding: ${({ active }) => (active ? "0 12px" : "0")};
  flex-shrink: 0;
  overflow: hidden;
  border: none;
  border-radius: 10px;
  background: ${({ active }) => (active ? "var(--ref-danger)" : "var(--ref-primary-soft)")};
  color: ${({ active }) => (active ? "#fff" : "var(--ref-primary)")};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  /* horizontal-only ცვლილება — width/padding/gap-ს ვანიმაციურებთ, ვერტიკალურად ღილაკი არ იძვრის */
  transition: max-width 0.25s ease, padding 0.25s ease, gap 0.25s ease, background 0.2s ease,
    color 0.2s ease;

  &:hover {
    /* background:#d9e4fb; */
    /* color: #ffffff; */
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AddButtonLabel = styled("span")<{ active?: boolean }>`
  display: inline-block;
  overflow: hidden;
  max-width: ${({ active }) => (active ? "60px" : "0")};
  opacity: ${({ active }) => (active ? 1 : 0)};
  white-space: nowrap;
  transition: max-width 0.25s ease, opacity 0.2s ease ${({ active }) => (active ? "0.1s" : "0s")};
`;
