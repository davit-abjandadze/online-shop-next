import React from "react";
import * as S from "./style";

/** სტატისტიკის ბარათების skeleton — ჩატვირთვისას "იტვირთება..." ტექსტის მაგივრად. */
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <S.StatsGrid>
    {Array.from({ length: count }).map((_, i) => (
      <S.SkeletonStatCard key={i}>
        <S.SkeletonPulse width="48px" height="48px" radius="10px" />
        <div style={{ flex: 1 }}>
          <S.SkeletonPulse width="60px" height="22px" />
          <div style={{ marginTop: 8 }}>
            <S.SkeletonPulse width="100px" height="12px" />
          </div>
        </div>
      </S.SkeletonStatCard>
    ))}
  </S.StatsGrid>
);

/** სიის ელემენტების (კითხვები/კატეგორიები) skeleton ბარათები. */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <S.QuestionsList>
    {Array.from({ length: count }).map((_, i) => (
      <S.SkeletonCard key={i}>
        <S.SkeletonPulse width="70%" height="20px" />
        <S.SkeletonRow>
          <S.SkeletonPulse width="90px" height="22px" radius="8px" />
          <S.SkeletonPulse width="90px" height="22px" radius="8px" />
          <S.SkeletonPulse width="120px" height="22px" radius="8px" />
        </S.SkeletonRow>
        <S.SkeletonRow>
          <S.SkeletonPulse width="30%" height="34px" radius="8px" />
          <S.SkeletonPulse width="30%" height="34px" radius="8px" />
        </S.SkeletonRow>
      </S.SkeletonCard>
    ))}
  </S.QuestionsList>
);
