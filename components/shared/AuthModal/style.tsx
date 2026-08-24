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
  background: var(--ref-overlay);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const ModalContainer = styled(motion.div)`
  background: var(--ref-bg-elevated);
  width: 100%;
  max-width: 440px;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 24px 28px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ref-bg);
`;

export const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
  font-family: inherit;
`;

export const CloseButton = styled.button`
  background: var(--ref-bg-subtle);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ref-text-secondary);
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ref-bg);
    color: var(--ref-text-primary);
    transform: rotate(90deg);
  }
`;

export const TabBar = styled.div`
  display: flex;
  background: var(--ref-bg);
  padding: 4px;
  margin: 16px 28px 0;
  border-radius: 8px;
  gap: 4px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 14px;
  border: none;
  background: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  font-weight: ${({ active }) => (active ? "600" : "500")};
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none"};

  &:hover {
    color: var(--ref-text-primary);
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
  color: var(--ref-text-primary);
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border-soft)")};
  border-radius: 6px;
  font-size: 14px;
  color: var(--ref-text-primary);
  outline: none;
  transition: all 0.2s ease;
  background: var(--ref-bg-elevated);

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
    box-shadow: 0 0 0 4px ${({ $invalid }) => ($invalid ? "rgba(220, 53, 69, 0.15)" : "rgba(24, 119, 242, 0.15)")};
  }

  &::placeholder {
    color: var(--ref-text-secondary);
  }
`;

export const FieldError = styled.span`
  font-size: 12px;
  color: var(--ref-danger);
  margin-top: 2px;
`;

export const GenderSwitch = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 42px;
  border-radius: 999px;
  background: var(--ref-bg);
  border: 1.5px solid var(--ref-border-soft);
  padding: 3px;
`;

export const GenderThumb = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: ${({ position }) => (position === "left" ? "3px" : "50%")};
  width: calc(50% - 3px);
  border-radius: 999px;
  background: var(--ref-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const GenderOption = styled.button<{ active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: ${({ active }) => (active ? "var(--ref-text-on-primary)" : "var(--ref-text-secondary)")};
  font-weight: ${({ active }) => (active ? "700" : "500")};
  font-size: 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ active }) =>
      active ? "var(--ref-text-on-primary)" : "var(--ref-text-primary)"};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--ref-border-soft);
  border-radius: 6px;
  font-size: 14px;
  color: var(--ref-text-primary);
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--ref-bg-elevated);

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 4px rgba(24, 119, 242, 0.15);
  }
`;

export const TogglePasswordBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--ref-text-secondary);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: var(--ref-text-primary);
    background: var(--ref-bg);
  }
`;

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  background: ${({ disabled }) => (disabled ? "var(--ref-text-secondary)" : "var(--ref-primary)")};
  color: var(--ref-text-on-primary);
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background 0.15s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: var(--ref-primary-hover);
  }
`;

export const ErrorAlert = styled.div`
  background: var(--ref-danger-soft);
  border: 1px solid var(--ref-danger-soft);
  color: var(--ref-danger);
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessAlert = styled.div`
  background: var(--ref-success-soft);
  border: 1px solid var(--ref-success-soft);
  color: var(--ref-success);
  padding: 12px 16px;
  border-radius: 6px;
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
  color:white;
`;

export const LinkBtn = styled.button`
  background: none;
  border: none;
  color: var(--ref-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;

  &:hover {
    text-decoration: underline;
    color: var(--ref-primary-hover);
  }
`;
