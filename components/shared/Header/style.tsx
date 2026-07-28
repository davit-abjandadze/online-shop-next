import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 56px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
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
  width: 40px;
  height: 40px;
  background: #1877F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;



export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

export const LoginBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1877F2;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #166FE5;
  }
`;

export const ProfileTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F0F2F5;
  border: none;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #E4E6EB;
  }
`;

export const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1877F2;
  color: #ffffff;
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
  color: #050505;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 240px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
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
  border-bottom: 1px solid #F0F2F5;
  margin-bottom: 4px;
`;

export const UserEmail = styled.div`
  font-size: 12px;
  color: #65676B;
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
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ danger }) => (danger ? "#dc2626" : "#050505")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ danger }) => (danger ? "#fef2f2" : "#F7F8FA")};
    color: ${({ danger }) => (danger ? "#dc2626" : "#050505")};
  }
`;
