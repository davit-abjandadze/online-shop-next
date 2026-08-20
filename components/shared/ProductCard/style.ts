import styled from "styled-components";

export const Card = styled("a")`
  display: flex;
  flex-direction: column;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
`;

export const ImageWrap = styled("div")`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--ref-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const StockBadge = styled("span")<{ out?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: ${({ out }) => (out ? "#c0392b" : "var(--ref-primary)")};
`;

export const Body = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  flex: 1;
`;

export const CategoryLabel = styled("span")`
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const Name = styled("h3")`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Footer = styled("div")`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Price = styled("span")`
  font-size: 17px;
  font-weight: 800;
  color: var(--ref-primary);
`;

export const AddButton = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
