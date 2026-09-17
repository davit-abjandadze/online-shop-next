import React from "react";
import { StatusTransitionAvgDto } from "@/API_Client/client/models";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { HourglassIcon, QuestionMarkIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface TransitionTimesTableProps {
  data: StatusTransitionAvgDto;
}

// F4 ფაზა — სტატუსების გადასვლის საშუალო დროები (`GET /stats/orders/transition-times`).
export const TransitionTimesTable: React.FC<TransitionTimesTableProps> = ({ data }) => {
  if (!data.transitions.length) {
    return (
      <S.ChartCard>
        <S.ChartCardTitle>
          <S.ChartTitleText>
            <HourglassIcon size={14} /> სტატუსების გადასვლის დროები
          </S.ChartTitleText>
        </S.ChartCardTitle>
        <S.ChartSummaryHint>ამ პერიოდში სტატუსის ცვლილება არ დაფიქსირებულა.</S.ChartSummaryHint>
      </S.ChartCard>
    );
  }

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <HourglassIcon size={14} /> სტატუსების გადასვლის დროები
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartHintRow>
        <S.HintTooltip tabIndex={0}>
          <QuestionMarkIcon size={14} />
          <S.HintTooltipBubble>
            პერიოდი (from/to) გადასვლის *დასრულების* დროს ეხება — ანუ თუ შეკვეთა
            პერიოდის დაწყებამდე შეიცვალა ერთ სტატუსში, მაგრამ შემდეგ სტატუსში
            პერიოდის განმავლობაში გადავიდა, ეს გადასვლა ცხრილში ჩაითვლება.
          </S.HintTooltipBubble>
        </S.HintTooltip>
        საშუალო დრო გამოთვლილია სტატუსის ცვლილების დასრულების დროის მიხედვით
      </S.ChartHintRow>

      <S.TableScroll>
        <S.Table>
          <S.Thead>
            <S.Tr>
              <S.Th>გადასვლა</S.Th>
              <S.Th>საშუალო დრო</S.Th>
              <S.Th>რაოდენობა</S.Th>
            </S.Tr>
          </S.Thead>
          <tbody>
            {data.transitions.map((item, i) => (
              <S.Tr key={`${item.fromStatus}-${item.toStatus}-${i}`}>
                <S.Td>
                  <OrderStatusBadge status={item.fromStatus} />
                  <S.TransitionArrow>→</S.TransitionArrow>
                  <OrderStatusBadge status={item.toStatus} />
                </S.Td>
                <S.Td>{item.avgHumanReadable}</S.Td>
                <S.Td>{item.transitionCount}</S.Td>
              </S.Tr>
            ))}
          </tbody>
        </S.Table>
      </S.TableScroll>
    </S.ChartCard>
  );
};

export default TransitionTimesTable;
