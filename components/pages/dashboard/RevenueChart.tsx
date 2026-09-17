import React from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { RevenueOverTimeDto } from "@/API_Client/client/models";
import { ChartIcon } from "@/components/ui/RefIcons";
import { StatsGroupBy } from "./DateRangePicker";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const formatCurrency = (value: number) => `${value.toFixed(2)} ₾`;

const formatBucketLabel = (date: string, groupBy: StatsGroupBy) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  if (groupBy === "month") return d.toLocaleDateString("ka-GE", { month: "2-digit", year: "numeric" });
  return d.toLocaleDateString("ka-GE", { day: "2-digit", month: "2-digit" });
};

interface RevenueChartProps {
  data: RevenueOverTimeDto;
  groupBy: StatsGroupBy;
}

// F3 ფაზა — შემოსავლის time-series გრაფიკი + წინა პერიოდთან შედარების ინდიკატორი.
export const RevenueChart: React.FC<RevenueChartProps> = ({ data, groupBy }) => {
  const direction: "up" | "down" | "flat" =
    data.changePercent === null || data.changePercent === 0 ? "flat" : data.changePercent > 0 ? "up" : "down";
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

  const chartData = {
    labels: data.buckets.map((b) => formatBucketLabel(b.date, groupBy)),
    datasets: [
      {
        label: "შემოსავალი",
        data: data.buckets.map((b) => b.revenue),
        borderColor: "#0080FF",
        backgroundColor: "rgba(0, 128, 255, 0.12)",
        pointRadius: 3,
        pointBackgroundColor: "#0080FF",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <ChartIcon size={14} /> შემოსავალი დროში
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartSummaryRow>
        <S.ChartSummaryValue>{formatCurrency(data.totalRevenue)}</S.ChartSummaryValue>
        <S.TrendBadge direction={direction}>
          {arrow} {data.changePercent === null ? "—" : `${Math.abs(data.changePercent).toFixed(1)}%`}
        </S.TrendBadge>
        <S.ChartSummaryHint>წინა პერიოდი: {formatCurrency(data.previousPeriodRevenue)}</S.ChartSummaryHint>
      </S.ChartSummaryRow>

      <S.ChartCanvasWrapper role="img" aria-label="შემოსავლის დროში ცვლილების გრაფიკი">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      </S.ChartCanvasWrapper>
    </S.ChartCard>
  );
};

export default RevenueChart;
