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
  max-width: 480px;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ref-bg);
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
  font-family: inherit;
`;

export const CloseButton = styled.button`
  background: var(--ref-bg-subtle);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ref-text-secondary);
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ref-bg);
    color: var(--ref-text-primary);
    transform: rotate(90deg);
  }
`;

export const Preview = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 20px;
`;

export const PreviewImageWrap = styled.div`
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--ref-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ref-text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const PreviewPrice = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const PreviewDescription = styled.p`
  margin: 0;
  font-size: 12.5px;
  color: var(--ref-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PreviewAddress = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ref-text-secondary);
`;

export const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 4px 20px 20px;
`;

export const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  border: none;
  border-radius: 12px;
  background: var(--ref-bg);
  color: var(--ref-text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: var(--ref-bg-subtle);
    transform: translateY(-1px);
  }
`;

export const ActionIconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
`;
