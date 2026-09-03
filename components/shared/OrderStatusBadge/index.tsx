import React from "react";
import styled from "styled-components";
import useTranslation from "next-translate/useTranslation";
import { OrderStatus } from "@/API_Client/types";

// შეკვეთის სტატუსის ერთი წყარო label/ფერისთვის — orders/orderDetail/adminOrders
// გვერდები ერთნაირად რომ გამოსახავდნენ სტატუსს, დუბლირების გარეშე. "common"
// namespace-ია (არა "orders"), რადგან ეს badge dashboard-შიც (adminOrders) გამოიყენება,
// სადაც "orders" namespace i18n.json-ის მიხედვით ჩატვირთული არაა.
const STATUS_LABEL_KEYS: Record<OrderStatus, string> = {
  pending: "order-status-pending",
  paid: "order-status-paid",
  processing: "order-status-processing",
  shipped: "order-status-shipped",
  delivered: "order-status-delivered",
  cancelled: "order-status-cancelled",
  expired: "order-status-expired",
};

const STATUS_VARIANT: Record<OrderStatus, "warning" | "success" | "primary" | "danger"> = {
  pending: "warning",
  paid: "success",
  processing: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
  expired: "danger",
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

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation("common");
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {STATUS_LABEL_KEYS[status] ? t(STATUS_LABEL_KEYS[status]) : status}
    </Badge>
  );
};

export default OrderStatusBadge;
