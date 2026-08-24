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
  aspect-ratio: 1 / 1;
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
  gap: 6px;
  font-variant-numeric: tabular-nums;
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
`;

export const AddButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--ref-primary);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
