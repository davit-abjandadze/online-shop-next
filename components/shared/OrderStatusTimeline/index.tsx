import React from "react";
import useTranslation from "next-translate/useTranslation";
import { OrderStatus, OrderStatusHistory } from "@/API_Client/types";
import { CheckCircleIcon, CloseIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// შეკვეთის სტატუსების ისტორია (statusHistory) მხოლოდ GET /orders/:id-ზე
// მოდის ბექენდიდან, უკვე ქრონოლოგიურად დალაგებული (ASC) — იხ.
// online-shop-nest/src/orders/orders.service.ts findOrderOrThrow. აქ უბრალოდ
// ვასახავთ თითო ჩანაწერს ვერტიკალურ timeline-ად, დამატებითი დახარისხების
// გარეშე.
const TERMINAL_DANGER_STATUSES: OrderStatus[] = ["cancelled", "expired"];

const STATUS_LABEL_KEYS: Record<OrderStatus, string> = {
  pending: "order-status-pending",
  paid: "order-status-paid",
  processing: "order-status-processing",
  shipped: "order-status-shipped",
  delivered: "order-status-delivered",
  cancelled: "order-status-cancelled",
  expired: "order-status-expired",
};

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistory[];
  locale?: string;
  className?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ statusHistory, locale, className }) => {
  const { t } = useTranslation("orders");
  const { t: tCommon } = useTranslation("common");

  if (!statusHistory.length) return null;

  // changedBy არსებობის შემთხვევაში ადმინის ხელით შეცვლილი სტატუსია,
  // წინააღმდეგ შემთხვევაში — სისტემური/ავტომატური გადასვლა (BOG webhook
  // pending→paid, cron-ის pending→expired, ან საწყისი pending შექმნისას).
  const describeChange = (entry: OrderStatusHistory) => {
    if (entry.changedBy) {
      const { firstName, lastName } = entry.changedBy;
      const name = [firstName, lastName].filter(Boolean).join(" ").trim();
      return name ? t("timeline-changed-by-admin-named", { name }) : t("timeline-changed-by-admin");
    }
    switch (entry.status) {
      case "pending":
        return t("timeline-auto-created");
      case "paid":
        return t("timeline-auto-paid");
      case "expired":
        return t("timeline-auto-expired");
      default:
        return t("timeline-auto-generic");
    }
  };

  return (
    <div className={className}>
      <S.TimelineTitle>{t("timeline-title")}</S.TimelineTitle>
      <S.TimelineList>
        {statusHistory.map((entry, index) => {
          const isLast = index === statusHistory.length - 1;
          const isDanger = TERMINAL_DANGER_STATUSES.includes(entry.status);
          return (
            <S.TimelineItem key={entry.id} isLast={isLast}>
              <S.TimelineDot variant={isDanger ? "danger" : "success"}>
                {isDanger ? <CloseIcon size={12} /> : <CheckCircleIcon size={12} />}
              </S.TimelineDot>
              <S.TimelineBody>
                <S.TimelineStatus>
                  {STATUS_LABEL_KEYS[entry.status] ? tCommon(STATUS_LABEL_KEYS[entry.status]) : entry.status}
                </S.TimelineStatus>
                <S.TimelineMeta>
                  {new Date(entry.createdAt).toLocaleString(locale === "ka" ? "ka-GE" : locale)} ·{" "}
                  {describeChange(entry)}
                </S.TimelineMeta>
              </S.TimelineBody>
            </S.TimelineItem>
          );
        })}
      </S.TimelineList>
    </div>
  );
};

export default OrderStatusTimeline;
