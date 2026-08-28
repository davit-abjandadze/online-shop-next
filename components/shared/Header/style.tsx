import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 76px;
  /* მინის ეფექტი: სქროლისას ქვედა კონტენტი ოდნავ გაჩანს ბლურის მიღმა */
  background: color-mix(in srgb, var(--ref-bg-elevated) 88%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--ref-border-soft);
  transition: background 0.2s ease, border-color 0.2s ease;
`;

export const Container = styled.div`
  max-width: 1320px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  /* justify-content: space-between-ის ნაცვლად ლოგო და მენიუ მარცხნივ ერთად
     ვამაგრეთ fixed gap-ით, Actions კი margin-left: auto-თი მარჯვნივ ვისვამთ —
     ასე სერჩის გაფართოებისას (focus-within) მენიუ აღარ იძვრება ადგილიდან */
  justify-content: flex-start;
  gap: 40px;
`;

export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
`;

export const LogoBadge = styled.div`
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  overflow: hidden;

  img {
    height: 60px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    img {
      height: 44px;
    }
  }
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 30px;
  flex-shrink: 0;

  @media (max-width: 960px) {
    display: none;
  }
`;

export const NavLink = styled.a<{ active?: boolean }>`
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  color: ${({ active }) => (active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  white-space: nowrap;
  transition: color 0.15s ease;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  flex-shrink: 0;
  margin-left: auto;
`;

export const SearchWrapper = styled.div`
  position: relative;

  @media (max-width: 1100px) {
    display: none;
  }
`;

export const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--ref-bg-subtle);
  border-radius: 12px;
  padding: 9px 14px;
  width: 220px;
  color: var(--ref-text-disabled);
  transition: width 0.2s ease;

  &:focus-within {
    width: 260px;
    color: var(--ref-primary);
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 13px;
  color: var(--ref-text-primary);
  font-family: inherit;

  &::placeholder {
    color: var(--ref-text-disabled);
  }
`;

export const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;
  box-shadow: var(--ref-shadow-lg);
  padding: 8px;
  z-index: 100;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const SuggestionsStatus = styled.div`
  padding: 14px;
  font-size: 13px;
  color: var(--ref-text-secondary);
  text-align: center;
`;

export const SuggestionItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: var(--ref-bg-subtle);
  }
`;

export const SuggestionImage = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ref-bg-subtle);
  color: var(--ref-text-disabled);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const SuggestionInfo = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SuggestionName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--ref-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SuggestionPriceGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SuggestionPrice = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--ref-primary);
`;

export const SuggestionOldPrice = styled.span`
  font-size: 11px;
  color: var(--ref-text-disabled);
  text-decoration: line-through;
`;

export const WishlistButton = styled.button`
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
  flex-shrink: 0;

  &:hover {
    background: var(--ref-border-soft);
    border-color: var(--ref-primary);
    color: var(--ref-primary);
  }
`;

export const WishlistBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
`;

export const LoginBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--ref-shadow-sm);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--ref-primary-hover);
    box-shadow: var(--ref-shadow-md);
    transform: translateY(-1px);
  }

  @media (max-width: 420px) {
    padding: 9px 14px;
  }
`;

/* "/ ავტორიზაცია" იკუმშება ვიწრო ეკრანებზე, თორემ ღილაკის სრული ტექსტი
   ჰედერის სივრცეს გადადის და გვერდს ჰორიზონტალურად ავრცელებს */
export const LoginBtnFullLabel = styled.span`
  @media (max-width: 420px) {
    display: none;
  }
`;

export const ProfileTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ref-bg-subtle);
  border: 1px solid var(--ref-border-soft);
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--ref-border-soft);
    border-color: var(--ref-primary);
  }
`;

export const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%);
  color: var(--ref-text-on-primary);
  font-weight: 700;
  font-size: 13px;
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

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;
  box-shadow: var(--ref-shadow-lg);
  padding: 8px;
  z-index: 100;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const DropdownHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid var(--ref-border-soft);
  margin-bottom: 4px;
`;

export const DropdownHeaderName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--ref-text-primary);
`;

export const UserEmail = styled.div`
  font-size: 12px;
  color: var(--ref-text-secondary);
  word-break: break-all;
`;

export const DropdownItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ danger }) => (danger ? "var(--ref-danger)" : "var(--ref-text-primary)")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ danger }) => (danger ? "var(--ref-danger-soft)" : "var(--ref-bg-subtle)")};
  }
`;
