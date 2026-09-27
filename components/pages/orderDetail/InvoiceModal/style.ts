import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--ref-overlay);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const ModalContainer = styled.div`
  background: var(--ref-bg-elevated);
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 18px 22px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
`;

export const CloseButton = styled.button`
  background: var(--ref-bg-subtle);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ref-text-secondary);

  &:hover {
    background: var(--ref-bg);
    color: var(--ref-text-primary);
  }
`;

export const Form = styled.form`
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const RecipientTypeRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const RecipientTypeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  background: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "var(--ref-text-on-primary)" : "var(--ref-text-primary)")};
  transition: all 0.15s ease;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-text-primary);

  span {
    font-weight: 500;
    color: var(--ref-text-secondary);
  }
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border-soft)")};
  border-radius: 6px;
  font-size: 13px;
  color: var(--ref-text-primary);
  outline: none;
  background: var(--ref-bg-elevated);

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
  }
`;

export const FieldError = styled.span`
  font-size: 11px;
  color: var(--ref-danger);
`;

export const SubmitButton = styled.button`
  margin-top: 4px;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: var(--ref-primary-hover);
  }
`;

export const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const GhostButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(--ref-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const PrintButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--ref-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ---- ინვოისის დოკუმენტის ეკრანული პრევიუ (რეალური PDF ცალკე
// InvoicePdfDocument.tsx-ითაა აგებული @react-pdf/renderer-ისთვის) ----

export const InvoiceDocument = styled.div`
  padding: 26px 28px;
  color: #111;
  font-size: 13px;
`;

export const InvoiceHeading = styled.h2`
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px 0;
`;

export const InvoiceMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: #555;
  margin-bottom: 20px;
`;

export const InvoicePartiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 22px;
`;

export const PartyBlock = styled.div``;

export const PartyTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #777;
  margin-bottom: 6px;
`;

export const PartyLine = styled.div`
  line-height: 1.5;
`;

export const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 18px;

  th,
  td {
    padding: 8px 6px;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #777;
  }

  td.numeric,
  th.numeric {
    text-align: right;
  }
`;

export const InvoiceTotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  font-size: 16px;
  font-weight: 800;
  padding-top: 8px;
`;
