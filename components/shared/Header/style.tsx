import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 68px;
  /* მინის ეფექტი: სქროლისას ქვედა კონტენტი ოდნავ გაჩანს ბლურის მიღმა */
  background: color-mix(in srgb, var(--ref-bg-elevated) 82%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--ref-border-soft);
  transition: background 0.2s ease, border-color 0.2s ease;
`;

export const Container = styled.div`
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
`;

export const LogoBadge = styled.div`
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  overflow: hidden;

  img {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    img {
      height: 30px;
    }
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

export const ThemeToggleButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ref-border-soft);
  border-radius: 50%;
  background: var(--ref-bg-subtle);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--ref-border-soft);
    border-color: var(--ref-primary);
    transform: rotate(12deg);
  }
`;

export const LoginBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  border: none;
  border-radius: 10px;
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

export const ProfileName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
  white-space: nowrap;
  text-overflow: ellipsis;  overflow: hidden;
  @media (max-width: 600px) {
    max-width: 70px;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
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
