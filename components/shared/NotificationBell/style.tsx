import styled from "styled-components";

// Header-ის WishlistButton/WishlistBadge-ის იგივე სტილი (components/shared/Header/style.tsx) —
// ბელის ღილაკიც იმავე circular ხატულა+ბეჯის პატერნს მისდევს.
export const Wrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const BellButton = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ref-border-soft);
  border-radius: 50%;
  background: var(--ref-bg-subtle);
  color: var(--ref-text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--ref-border-soft);
    border-color: var(--ref-primary);
    color: var(--ref-primary);
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--ref-danger, #e5484d);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;

  @media (max-width: 480px) {
    min-width: 14px;
    height: 14px;
    font-size: 9px;
    line-height: 14px;
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;
  box-shadow: var(--ref-shadow-lg);
  z-index: 100;
  animation: notificationFadeIn 0.2s ease;
  overflow: hidden;

  @keyframes notificationFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const DropdownTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--ref-text-primary);
`;

export const MarkAllReadBtn = styled.button`
  background: none;
  border: none;
  color: var(--ref-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    text-decoration: none;
  }
`;

export const List = styled.div`
  max-height: 380px;
  overflow-y: auto;
`;

export const ListItem = styled.button<{ unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-bottom: 1px solid var(--ref-border-soft);
  background: ${({ unread }) => (unread ? "var(--ref-bg-subtle)" : "transparent")};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;

  &:hover {
    background: var(--ref-border-soft);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemDot = styled.span<{ unread?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
  background: ${({ unread }) => (unread ? "var(--ref-primary)" : "transparent")};
  position: absolute;
  top: 9px;
  left: 3px;
`;

export const ItemThumbnail = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const ItemThumbnailFallback = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ref-bg-subtle);
  color: var(--ref-text-secondary);
`;

export const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemTitle = styled.div<{ unread?: boolean }>`
  font-size: 13px;
  font-weight: ${({ unread }) => (unread ? 700 : 500)};
  color: var(--ref-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ItemSnippet = styled.div`
  font-size: 12px;
  color: var(--ref-text-secondary);
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ItemDate = styled.div`
  font-size: 11px;
  color: var(--ref-text-secondary);
  margin-top: 4px;
`;

export const EmptyList = styled.div`
  padding: 32px 14px;
  text-align: center;
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

export const LoadMoreBtn = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid var(--ref-border-soft);
  background: none;
  color: var(--ref-primary);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--ref-bg-subtle);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

// მობილურ MobilePopup-ში (bottom-sheet) კონტენტს საკუთარი padding არ აქვს —
// ეს wrapper ამატებს იმ padding-ს, რასაც დესქტოპზე S.ModalContent/S.Dropdown იძლევა.
export const MobileContentPadding = styled.div`
  padding: 20px 16px 8px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalContent = styled.div`
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--ref-bg-elevated);
  border-radius: 16px;
  box-shadow: var(--ref-shadow-lg);
  padding: 20px;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const ModalDate = styled.div`
  font-size: 12px;
  color: var(--ref-text-secondary);
  margin-top: 4px;
`;

export const ModalCloseButton = styled.button`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--ref-bg-subtle);
  color: var(--ref-text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--ref-border-soft);
    color: var(--ref-text-primary);
  }
`;

export const ModalImage = styled.div`
  width: 100%;
  max-height: 320px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;

  img {
    width: 100%;
    height: 100%;
    max-height: 320px;
    object-fit: cover;
    display: block;
  }
`;

// admin-ის rich-text ედიტორის sanitize-ული HTML output-ის ჩვენება — RichTextEditable-ის
// (dashboard/style.ts) იგივე ტიპოგრაფიის წესები ტექსტისთვის.
export const ModalBody = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: var(--ref-text-primary);
  word-break: break-word;

  p {
    margin: 0 0 10px 0;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }

  a {
    color: var(--ref-primary);
  }

  ul,
  ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }
`;

// მოდალის ბოლოში admin-ის მიერ დამატებული ღილაკები (actions) — close/link ტიპის.
export const ModalActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

export const ModalActionButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
`;
