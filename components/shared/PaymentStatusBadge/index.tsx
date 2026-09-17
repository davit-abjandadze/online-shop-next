import React from "react";
import styled from "styled-components";
import useTranslation from "next-translate/useTranslation";
import { PaymentStatusBreakdownItemDtoStatusEnum as PaymentStatus } from "@/API_Client/client/models/payment-status-breakdown-item-dto";

// OrderStatusBadge-ის იდენტური პატერნი — "common" namespace, რომ dashboard-შიც
// (სადაც "orders"/"payments" namespace-ები ჩატვირთული არაა) იმუშაოს.
const STATUS_LABEL_KEYS: Record<PaymentStatus, string> = {
  created: "payment-status-created",
  processing: "payment-status-processing",
  completed: "payment-status-completed",
  rejected: "payment-status-rejected",
  refunded: "payment-status-refunded",
  partial_completed: "payment-status-partial_completed",
};

const STATUS_VARIANT: Record<PaymentStatus, "warning" | "success" | "primary" | "danger"> = {
  created: "warning",
  processing: "primary",
  completed: "success",
  rejected: "danger",
  refunded: "danger",
  partial_completed: "warning",
};

const Badge = styled("span")<{ variant: "warning" | "success" | "primary" | "danger" }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  ${({ variant }) => {
    switch (variant) {
      case "success":
        return "background: var(--ref-success-soft); color: var(--ref-success);";
      case "danger":
        return "background: var(--ref-danger-soft); color: var(--ref-danger);";
      case "warning":
        return "background: var(--ref-warning-soft); color: #b45309;";
      case "primary":
      default:
        return "background: var(--ref-primary-soft); color: var(--ref-primary-hover);";
    }
  }}
`;

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation("common");
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {STATUS_LABEL_KEYS[status] ? t(STATUS_LABEL_KEYS[status]) : status}
    </Badge>
  );
};

export default PaymentStatusBadge;
