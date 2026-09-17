import React from "react";
import useTranslation from "next-translate/useTranslation";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { OrderStatusBreakdownDto, OrderStatusBreakdownItemDtoStatusEnum } from "@/API_Client/client/models";
import { ChartIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// შეკვეთის სტატუსების ფიქსირებული თანმიმდევრობა — შედეგი ერთნაირად დალაგებული
// ჩანდეს ყოველთვის, მათ შორის ნულოვანი მნიშვნელობის სტატუსებისთვისაც.
const STATUS_ORDER: OrderStatusBreakdownItemDtoStatusEnum[] = [
  OrderStatusBreakdownItemDtoStatusEnum.Pending,
  OrderStatusBreakdownItemDtoStatusEnum.Paid,
  OrderStatusBreakdownItemDtoStatusEnum.Processing,
  OrderStatusBreakdownItemDtoStatusEnum.Shipped,
  OrderStatusBreakdownItemDtoStatusEnum.Delivered,
  OrderStatusBreakdownItemDtoStatusEnum.Cancelled,
  OrderStatusBreakdownItemDtoStatusEnum.Expired,
];

const STATUS_LABEL_KEYS: Record<string, string> = {
  pending: "order-status-pending",
  paid: "order-status-paid",
  processing: "order-status-processing",
  shipped: "order-status-shipped",
  delivered: "order-status-delivered",
  cancelled: "order-status-cancelled",
  expired: "order-status-expired",
};

// იგივე სემანტიკური ფერები, რაც OrderStatusBadge-ს აქვს (warning/success/primary/danger),
// მხოლოდ ბარ-ჩარტისთვის საკმარისი კონტრასტის მქონე ვარიანტებით (dataviz skill-ის validate_palette.js-ით დამოწმებული).
const STATUS_COLORS: Record<string, string> = {
  pending: "#b45309",
  paid: "#16a34a",
  processing: "#0080ff",
  shipped: "#0080ff",
  delivered: "#16a34a",
  cancelled: "#f61c1c",
  expired: "#f61c1c",
};

interface OrderStatusChartProps {
  data: OrderStatusBreakdownDto;
}

// F4 ფაზა — შეკვეთების სტატუსების განაწილება (`GET /stats/orders/status-breakdown`).
export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const { t } = useTranslation("common");

  const countByStatus = new Map(data.breakdown.map((item) => [item.status, item.count]));

  const chartData = {
    labels: STATUS_ORDER.map((status) => t(STATUS_LABEL_KEYS[status])),
    datasets: [
      {
        label: "შეკვეთები",
        data: STATUS_ORDER.map((status) => countByStatus.get(status) ?? 0),
        backgroundColor: STATUS_ORDER.map((status) => STATUS_COLORS[status]),
        borderRadius: 4,
        maxBarThickness: 26,
      },
    ],
  };

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <ChartIcon size={14} /> შეკვეთების სტატუსები
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartSummaryRow>
        <S.ChartSummaryValue>{data.total}</S.ChartSummaryValue>
        <S.ChartSummaryHint>სულ შეკვეთა პერიოდში</S.ChartSummaryHint>
      </S.ChartSummaryRow>

      <S.ChartCanvasWrapper style={{ height: 260 }} role="img" aria-label="შეკვეთების სტატუსების განაწილების ბარ-გრაფიკი">
        <Bar
          data={chartData}
          options={{
            indexAxis: "y" as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.formattedValue} შეკვეთა`,
                },
              },
            },
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
            },
          }}
        />
      </S.ChartCanvasWrapper>
    </S.ChartCard>
  );
};

export default OrderStatusChart;
