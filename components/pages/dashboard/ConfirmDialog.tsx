import React from "react";
import { CloseIcon, WarningIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * გამოსაცვლელი `window.confirm()`-ის ნაცვლად — თანმიმდევრული, აპლიკაციის
 * სტილში გაფორმებული დადასტურების დიალოგი (მაგ. წაშლის ოპერაციებისთვის).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = "დადასტურება",
  cancelLabel = "გაუქმება",
  confirming = false,
  variant = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <S.ModalOverlay onClick={onCancel}>
      <S.ModalContent style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8, color: variant === "danger" ? "var(--ref-danger)" : undefined }}>
            <WarningIcon size={18} /> {title}
          </S.ModalTitle>
          <S.CloseButton onClick={onCancel}>
            <CloseIcon size={16} />
          </S.CloseButton>
        </S.ModalHeader>
        {description && <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>{description}</p>}
        <S.ModalFooter>
          <S.ActionButton type="button" variant="secondary" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </S.ActionButton>
          <S.ActionButton type="button" variant={variant} onClick={onConfirm} disabled={confirming}>
            {confirming ? "მუშავდება..." : confirmLabel}
          </S.ActionButton>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default ConfirmDialog;
