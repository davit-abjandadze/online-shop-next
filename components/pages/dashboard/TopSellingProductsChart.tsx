import React from "react";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ProductStatDto } from "@/API_Client/client/models";
import {
  StatsControllerGetTopSellingProductsOrderEnum as Order,
  StatsControllerGetTopSellingProductsSortByEnum as SortBy,
} from "@/API_Client/client/apis/stats-api";
import { FireIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const LIMIT_OPTIONS = [5, 10, 20, 50];

const formatCurrency = (value: number) => `${value.toFixed(2)} ₾`;

// dataviz-ის label-truncation რეკომენდაცია — გრძელი პროდუქტის სახელები
// y-ღერძზე ბარებს არ გაუშლის, სრული სახელი tooltip-ის title-ში ჩანს.
const truncate = (text: string, max = 22) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

interface TopSellingProductsChartProps {
  data: ProductStatDto[];
  sortBy: SortBy;
  order: Order;
  limit: number;
  onSortByChange: (sortBy: SortBy) => void;
  onOrderChange: (order: Order) => void;
  onLimitChange: (limit: number) => void;
}

// F5 ფაზა — ტოპ-გაყიდვადი პროდუქტები (`GET /stats/products/top-selling`).
// F7 ფაზა — `order` (ASC/DESC) კონტროლი დაემატა: აქამდე ბექენდის მხარდაჭერილი პარამეტრი
// ფრონტიდან საერთოდ არ იგზავნებოდა (ყოველთვის default DESC-ს ეყრდნობოდა), ასე რომ
// "ბოლო-N" (ყველაზე ცუდად გაყიდვადი) ხედვა მიუწვდომელი იყო.
export const TopSellingProductsChart: React.FC<TopSellingProductsChartProps> = ({
  data,
  sortBy,
  order,
  limit,
  onSortByChange,
  onOrderChange,
  onLimitChange,
}) => {
  const isRevenue = sortBy === SortBy.Revenue;

  const chartData = {
    labels: data.map((item) => truncate(item.productName)),
    datasets: [
      {
        label: isRevenue ? "შემოსავალი" : "გაყიდული ერთეული",
        data: data.map((item) => (isRevenue ? item.revenue : item.quantitySold)),
        backgroundColor: "#0080ff",
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  };

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <FireIcon size={14} /> ტოპ-გაყიდვადი პროდუქტები
        </S.ChartTitleText>
        <S.PeriodSelector>
          <S.PeriodButton type="button" active={isRevenue} onClick={() => onSortByChange(SortBy.Revenue)}>
            შემოსავალი
          </S.PeriodButton>
          <S.PeriodButton type="button" active={!isRevenue} onClick={() => onSortByChange(SortBy.Quantity)}>
            რაოდენობა
          </S.PeriodButton>
        </S.PeriodSelector>
      </S.ChartCardTitle>

      <S.ChartHintRow>
        <S.Select value={order} onChange={(e) => onOrderChange(e.target.value as Order)} style={{ width: "auto" }}>
          <option value={Order.Desc}>საუკეთესო</option>
          <option value={Order.Asc}>ყველაზე სუსტი</option>
        </S.Select>
        <S.Select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          style={{ width: "auto" }}
        >
          {LIMIT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              ტოპ {opt}
            </option>
          ))}
        </S.Select>
      </S.ChartHintRow>

      {data.length === 0 ? (
        <S.ChartSummaryHint>ამ პერიოდში გაყიდვები არ დაფიქსირებულა.</S.ChartSummaryHint>
      ) : (
        <S.ChartCanvasWrapper
          style={{ height: Math.max(180, data.length * 30) }}
          role="img"
          aria-label="ტოპ-გაყიდვადი პროდუქტების ბარ-გრაფიკი"
        >
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
                    title: (items) => data[items[0].dataIndex]?.productName || "",
                    label: (ctx) =>
                      isRevenue ? ` ${formatCurrency(Number(ctx.raw))}` : ` ${ctx.formattedValue} ცალი`,
                  },
                },
              },
              scales: {
                x: { beginAtZero: true, ticks: { precision: isRevenue ? undefined : 0 } },
              },
            }}
          />
        </S.ChartCanvasWrapper>
      )}
    </S.ChartCard>
  );
};

export default TopSellingProductsChart;
