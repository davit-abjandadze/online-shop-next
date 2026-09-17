import React from "react";
import useTranslation from "next-translate/useTranslation";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { PaymentStatsDto } from "@/API_Client/client/models";
import { PaymentStatusBreakdownItemDtoStatusEnum as PaymentStatus } from "@/API_Client/client/models/payment-status-breakdown-item-dto";
import { CheckCircleIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// გადახდის სტატუსების ფიქსირებული თანმიმდევრობა — ნულოვანი count-ითაც ჩანდეს.
const STATUS_ORDER: PaymentStatus[] = [
  PaymentStatus.Created,
  PaymentStatus.Processing,
  PaymentStatus.Completed,
  PaymentStatus.PartialCompleted,
  PaymentStatus.Rejected,
  PaymentStatus.Refunded,
];

const STATUS_LABEL_KEYS: Record<string, string> = {
  created: "payment-status-created",
  processing: "payment-status-processing",
  completed: "payment-status-completed",
  rejected: "payment-status-rejected",
  refunded: "payment-status-refunded",
  partial_completed: "payment-status-partial_completed",
};

// OrderStatusChart-ის იდენტური სემანტიკური ჯგუფები/ჰექს-ვარიანტები (dataviz
// skill-ის validate_palette.js-ით უკვე დამოწმებული).
const STATUS_COLORS: Record<string, string> = {
  created: "#b45309",
  processing: "#0080ff",
  completed: "#16a34a",
  partial_completed: "#b45309",
  rejected: "#f61c1c",
  refunded: "#f61c1c",
};

interface PaymentStatsChartProps {
  data: PaymentStatsDto;
}

// F6 ფაზა — გადახდების სტატისტიკა (`GET /stats/payments`). `successRatePercent`
// არის `null`, თუ პერიოდში საერთოდ გადახდები არ ყოფილა.
export const PaymentStatsChart: React.FC<PaymentStatsChartProps> = ({ data }) => {
  const { t } = useTranslation("common");

  const countByStatus = new Map(data.breakdown.map((item) => [item.status, item.count]));

  const chartData = {
    labels: STATUS_ORDER.map((status) => t(STATUS_LABEL_KEYS[status])),
    datasets: [
      {
        label: "გადახდები",
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
          <CheckCircleIcon size={14} /> გადახდების სტატისტიკა
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartSummaryRow>
        <S.ChartSummaryValue>
          {data.successRatePercent === null ? "—" : `${data.successRatePercent.toFixed(1)}%`}
        </S.ChartSummaryValue>
        <S.ChartSummaryHint>წარმატებული გადახდების წილი ({data.total} სულ)</S.ChartSummaryHint>
      </S.ChartSummaryRow>

      <S.ChartCanvasWrapper style={{ height: 260 }} role="img" aria-label="გადახდების სტატუსების განაწილების ბარ-გრაფიკი">
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
                  label: (ctx) => ` ${ctx.formattedValue} გადახდა`,
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

export default PaymentStatsChart;
