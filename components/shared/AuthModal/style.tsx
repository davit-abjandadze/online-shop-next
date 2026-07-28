import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const ModalContainer = styled(motion.div)`
  background: #ffffff;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 24px 28px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
`;

export const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-family: inherit;
`;

export const CloseButton = styled.button`
  background: #f8fafc;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    transform: rotate(90deg);
  }
`;

export const TabBar = styled.div`
  display: flex;
  background: #f8fafc;
  padding: 4px;
  margin: 16px 28px 0;
  border-radius: 14px;
  gap: 4px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 14px;
  border: none;
  background: ${({ active }) => (active ? "#ffffff" : "transparent")};
  color: ${({ active }) => (active ? "#0f172a" : "#64748b")};
  font-weight: ${({ active }) => (active ? "600" : "500")};
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none"};

  &:hover {
    color: #0f172a;
  }
`;

export const FormContainer = styled.form`
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const GenderSwitch = styled.div`
  display: flex;
  background: #f8fafc;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
`;

export const GenderOption = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 14px;
  border: none;
  background: ${({ active }) => (active ? "#ffffff" : "transparent")};
  color: ${({ active }) => (active ? "#0f172a" : "#64748b")};
  font-weight: ${({ active }) => (active ? "600" : "500")};
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none"};

  &:hover {
    color: #0f172a;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  }
`;

export const TogglePasswordBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: #0f172a;
    background: #f1f5f9;
  }
`;

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 14px;
  background: ${({ disabled }) =>
    disabled ? "#94a3b8" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"};
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: ${({ disabled }) =>
    disabled ? "none" : "0 4px 12px rgba(37, 99, 235, 0.25)"};
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessAlert = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 13px;
`;

export const LinkBtn = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;

  &:hover {
    text-decoration: underline;
    color: #1d4ed8;
  }
`;
