import React from "react";
import { ChartIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface StatsWidgetStateProps<T> {
  loading: boolean;
  error: boolean;
  data: T | null | undefined;
  skeleton: React.ReactNode;
  errorTitle: string;
  onRetry: () => void;
  children: (data: T) => React.ReactNode;
}

// F7 ფაზა — ერთგვაროვანი loading/error/empty მდგომარეობა ყველა stats widget-ისთვის,
// ცალკეული ტერნარული ბლოკების ნაცვლად (რომლებიც F2-F6-ში იდენტურად მეორდებოდა).
export function StatsWidgetState<T>({
  loading,
  error,
  data,
  skeleton,
  errorTitle,
  onRetry,
  children,
}: StatsWidgetStateProps<T>) {
  if (loading) return <>{skeleton}</>;

  if (error || data === null || data === undefined) {
    return (
      <S.EmptyState>
        <ChartIcon size={48} />
        <S.EmptyTitle>{errorTitle}</S.EmptyTitle>
        <S.EmptyText>სცადეთ გვერდის განახლება ან სცადეთ თავიდან.</S.EmptyText>
        <S.ActionButton variant="outline" onClick={onRetry}>
          ხელახლა ცდა
        </S.ActionButton>
      </S.EmptyState>
    );
  }

  return <>{children(data)}</>;
}
