import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px 24px;

  @media (max-width: 640px) {
    padding: 20px 12px 40px 12px;
  }
`;

export const Layout = styled("div")`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 36px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

export const Gallery = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const MainImage = styled("div")`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Thumbnails = styled("div")`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Thumbnail = styled("button")<{ active?: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  border: 2px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  background: var(--ref-bg-elevated);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Info = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const CategoryLabel = styled("span")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
`;

export const Title = styled("h1")`
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const Price = styled("div")`
  font-size: 28px;
  font-weight: 800;
  color: var(--ref-primary);
`;

export const StockLine = styled("div")<{ out?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ out }) => (out ? "#c0392b" : "var(--ref-text-secondary)")};
`;

export const Description = styled("p")`
  font-size: 15px;
  line-height: 1.6;
  color: var(--ref-text-secondary);
  white-space: pre-wrap;
`;

// პროდუქტის attribute-value-ების (მახასიათებლების) ცხრილი — description-ის ქვეშ.
export const SpecTable = styled("dl")`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 2fr;
  gap: 8px 16px;
  margin: 4px 0 0 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
`;

export const SpecLabel = styled("dt")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
`;

export const SpecValue = styled("dd")`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const AddToCartButton = styled("button")`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const NotFoundWrap = styled("div")`
  padding: 100px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
`;
