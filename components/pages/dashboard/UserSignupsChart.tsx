import React from "react";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { UserSignupsDto } from "@/API_Client/client/models";
import { UserIcon } from "@/components/ui/RefIcons";
import { StatsGroupBy } from "./DateRangePicker";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const formatBucketLabel = (date: string, groupBy: StatsGroupBy) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  if (groupBy === "month") return d.toLocaleDateString("ka-GE", { month: "2-digit", year: "numeric" });
  return d.toLocaleDateString("ka-GE", { day: "2-digit", month: "2-digit" });
};

interface UserSignupsChartProps {
  data: UserSignupsDto;
  groupBy: StatsGroupBy;
}

// F6 ფაზა — ახალი მომხმარებლების რეგისტრაცია დროში (`GET /stats/users/signups`).
export const UserSignupsChart: React.FC<UserSignupsChartProps> = ({ data, groupBy }) => {
  const chartData = {
    labels: data.buckets.map((b) => formatBucketLabel(b.date, groupBy)),
    datasets: [
      {
        label: "რეგისტრაციები",
        data: data.buckets.map((b) => b.count),
        backgroundColor: "#0080ff",
        borderRadius: 4,
        maxBarThickness: 26,
      },
    ],
  };

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <UserIcon size={14} /> ახალი მომხმარებლები
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartSummaryRow>
        <S.ChartSummaryValue>{data.totalSignups}</S.ChartSummaryValue>
        <S.ChartSummaryHint>სულ რეგისტრაცია პერიოდში</S.ChartSummaryHint>
      </S.ChartSummaryRow>

      <S.ChartCanvasWrapper role="img" aria-label="ახალი მომხმარებლების რეგისტრაციის ბარ-გრაფიკი">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.formattedValue} მომხმარებელი`,
                },
              },
            },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
            },
          }}
        />
      </S.ChartCanvasWrapper>
    </S.ChartCard>
  );
};

export default UserSignupsChart;
