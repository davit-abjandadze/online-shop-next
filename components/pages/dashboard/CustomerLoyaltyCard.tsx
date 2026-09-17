import React from "react";
import { CustomerLoyaltyDto } from "@/API_Client/client/models";
import { HeartIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

const REPEAT_COLOR = "#0080ff";
const ONE_TIME_COLOR = "#94a3b8";

interface CustomerLoyaltyCardProps {
  data: CustomerLoyaltyDto;
}

// F6 ფაზა — მომხმარებელთა ლოიალობა: განმეორებითი vs ერთჯერადი მყიდველები
// (`GET /stats/users/loyalty`). `repeatRatePercent` არის `null`, თუ პერიოდში
// საერთოდ არავის უყიდია — ამ დროს ბარი ცარიელია და პროცენტის მაგივრად "—" ჩანს.
export const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({ data }) => {
  const total = data.repeatCustomers + data.oneTimeCustomers;
  const repeatWidth = total === 0 ? 0 : (data.repeatCustomers / total) * 100;

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <HeartIcon size={14} /> მომხმარებელთა ლოიალობა
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.ChartSummaryRow>
        <S.ChartSummaryValue>
          {data.repeatRatePercent === null ? "—" : `${data.repeatRatePercent.toFixed(1)}%`}
        </S.ChartSummaryValue>
        <S.ChartSummaryHint>განმეორებითი მყიდველების წილი</S.ChartSummaryHint>
      </S.ChartSummaryRow>

      <S.LoyaltyBarTrack>
        {total > 0 && <S.LoyaltyBarFill width={repeatWidth} color={REPEAT_COLOR} />}
        {total > 0 && <S.LoyaltyBarFill width={100 - repeatWidth} color={ONE_TIME_COLOR} />}
      </S.LoyaltyBarTrack>

      <S.LoyaltyLegend>
        <S.LoyaltyLegendItem>
          <S.LoyaltyDot color={REPEAT_COLOR} />
          განმეორებითი: {data.repeatCustomers}
        </S.LoyaltyLegendItem>
        <S.LoyaltyLegendItem>
          <S.LoyaltyDot color={ONE_TIME_COLOR} />
          ერთჯერადი: {data.oneTimeCustomers}
        </S.LoyaltyLegendItem>
      </S.LoyaltyLegend>
    </S.ChartCard>
  );
};

export default CustomerLoyaltyCard;
