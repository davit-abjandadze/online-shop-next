import React from "react";
import { CalendarIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export type StatsGroupBy = "day" | "week" | "month";

const GROUP_BY_OPTIONS: { value: StatsGroupBy; label: string }[] = [
  { value: "day", label: "დღე" },
  { value: "week", label: "კვირა" },
  { value: "month", label: "თვე" },
];

export interface DateRangeValue {
  from?: string;
  to?: string;
  groupBy?: StatsGroupBy;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  // ზოგ ენდპოინტს (მაგ. branch sales, low-stock) groupBy საერთოდ არ სჭირდება.
  showGroupBy?: boolean;
}

// გამოსაყენებელი ყველა სტატისტიკის widget-ში, სადაც `from`/`to`
// (და საჭიროებისამებრ `groupBy`) query პარამეტრებია — ერთხელ აშენებული,
// რომ თითოეულმა გვერდმა თავისი date input-ები არ გაიმეოროს.
export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, showGroupBy = true }) => {
  return (
    <S.FilterGrid>
      <S.FilterGroup>
        <S.FilterLabel>
          <CalendarIcon size={12} /> პერიოდის დასაწყისი
        </S.FilterLabel>
        <S.Input
          type="date"
          value={value.from ?? ""}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
        />
      </S.FilterGroup>

      <S.FilterGroup>
        <S.FilterLabel>
          <CalendarIcon size={12} /> პერიოდის დასასრული
        </S.FilterLabel>
        <S.Input
          type="date"
          value={value.to ?? ""}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
        />
      </S.FilterGroup>

      {showGroupBy && (
        <S.FilterGroup>
          <S.FilterLabel>დაჯგუფება</S.FilterLabel>
          <S.Select
            value={value.groupBy ?? "day"}
            onChange={(e) => onChange({ ...value, groupBy: e.target.value as StatsGroupBy })}
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </S.Select>
        </S.FilterGroup>
      )}
    </S.FilterGrid>
  );
};

export default DateRangePicker;
