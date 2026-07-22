import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
`;

export const Container = styled.div`
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
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
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;

  img{
  width:50px
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
  padding: 10px 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);

  &:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  }
`;

export const ProfileTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 14px 6px 6px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

export const AvatarCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
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
  color: #0f172a;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 240px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
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
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
`;

export const UserEmail = styled.div`
  font-size: 12px;
  color: #64748b;
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
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ danger }) => (danger ? "#dc2626" : "#334155")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ danger }) => (danger ? "#fef2f2" : "#f8fafc")};
    color: ${({ danger }) => (danger ? "#dc2626" : "#0f172a")};
  }
`;
