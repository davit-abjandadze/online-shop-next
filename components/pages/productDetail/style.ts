import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1320px;
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

export const MainImage = styled("div")<{ clickable?: boolean }>`
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ clickable }) => (clickable ? "zoom-in" : "default")};
  max-height: 400px;
  padding: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 16px;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

// ვიდეო-thumbnail-ის შუაში play-ღილაკის ხატულა.
export const PlayBadge = styled("div")`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
  }
`;

// გალერეის ლაითბოქსი — მთავარ სურათზე დაჭერისას იშლება.
export const LightboxOverlay = styled("div")`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
`;

export const LightboxClose = styled("button")`
  position: absolute;
  top: 20px;
  right: 24px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  z-index: 1;

  .close-icon {
    circle {
      fill: #ffffff;
    }
    path {
      stroke: #000000;
    }
  }
`;

export const LightboxNav = styled("button")<{ side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ side }) => (side === "left" ? "left: 16px;" : "right: 16px;")}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 7px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const LightboxContent = styled("div")`
  max-width: 1000px;
  width: 100%;
  max-height: 80vh;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  iframe {
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9;
    border: none;
  }
`;

export const LightboxThumbnails = styled("div")`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: flex-start;
  max-width: 100%;
`;

// thumbnail-სლაიდერის გარსი — ისრები + სქროლვადი ზოლი.
export const ThumbnailsWrap = styled("div")`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ThumbnailsNavBtn = styled("button")`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 26px;
  line-height: 1;
  padding-bottom:7px;

  &:hover {
    background: var(--ref-primary);
    color: #fff;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const Thumbnails = styled("div")`
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
  padding-bottom: 4px;

  /* scrollbar დამალვა — თავად ისრებით ვნავიგირებთ */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Thumbnail = styled("button")<{ active?: boolean }>`
  position: relative;
  flex-shrink: 0;
  scroll-snap-align: start;
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ out }) => (out ? "#c0392b" : "var(--ref-text-secondary)")};

  .close-icon {
    circle {
      fill: #c0392b;
    }
    path {
      stroke: #ffffff;
    }
  }
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

// ფერის არჩევის ბლოკი — მხოლოდ მარაგში მყოფი (stock > 0) ფერები ჩნდება.
export const ColorSection = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ColorSectionLabel = styled("div")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-secondary);
`;

export const ColorOptions = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const ColorOption = styled("button")<{ active?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  outline: ${({ active }) => (active ? "1px solid var(--ref-primary)" : "none")};
  outline-offset: 1px;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.08);
  }
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

// დამატებითი ინფორმაციის ბლოკები — Layout-ის (გალერეა + ინფო) ქვემოთ, სრულ სიგანეზე.
export const AdditionalInfoSection = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
`;

export const AdditionalInfoBlock = styled("div")`
  padding: 20px 24px;
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
`;

export const AdditionalInfoTitle = styled("h3")`
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const AdditionalInfoDescription = styled("div")`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ref-text-secondary);
  white-space: pre-wrap;

  p {
    margin: 0 0 8px 0;
  }
  p:last-child {
    margin-bottom: 0;
  }
  h3 {
    margin: 10px 0 6px 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--ref-text-primary);
  }
  ul,
  ol {
    margin: 6px 0;
    padding-left: 22px;
  }
  a {
    color: var(--ref-primary);
    text-decoration: underline;
  }
`;

export const NotFoundWrap = styled("div")`
  padding: 100px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
`;
