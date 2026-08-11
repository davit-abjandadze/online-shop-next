import React from "react";
import Link from "next/link";
import { BallotIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export const ReferendumFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <S.FooterWrapper>
      <S.Container>
        <S.Top>
          <S.Brand>
            <S.BrandBadge />
            <S.BrandText>
              <S.BrandTitle>სახალხო რეფერენდუმი</S.BrandTitle>
              <S.BrandSubtitle>
                გამოხატეთ თქვენი აზრი აქტუალურ საკითხებზე და იხილეთ საზოგადოებრივი შედეგები რეალურ დროში.
              </S.BrandSubtitle>
            </S.BrandText>
          </S.Brand>

          <S.LinksGroup>
            <S.LinkColumn>
              <S.LinkColumnTitle>ნავიგაცია</S.LinkColumnTitle>
              <Link href="/" passHref legacyBehavior>
                <S.FooterLink>მთავარი</S.FooterLink>
              </Link>
              <Link href="/user/favorites" passHref legacyBehavior>
                <S.FooterLink>ფავორიტები</S.FooterLink>
              </Link>
              <Link href="/user/activities" passHref legacyBehavior>
                <S.FooterLink>აქტივობები</S.FooterLink>
              </Link>
            </S.LinkColumn>

            <S.LinkColumn>
              <S.LinkColumnTitle>ანგარიში</S.LinkColumnTitle>
              <Link href="/user/profile" passHref legacyBehavior>
                <S.FooterLink>პროფილი</S.FooterLink>
              </Link>
              <Link href="/user/change-password" passHref legacyBehavior>
                <S.FooterLink>პაროლის შეცვლა</S.FooterLink>
              </Link>
            </S.LinkColumn>
          </S.LinksGroup>
        </S.Top>

        <S.Bottom>
          <S.Copyright>© {year} სახალხო რეფერენდუმი. ყველა უფლება დაცულია.</S.Copyright>
          <S.MadeWith>
            <BallotIcon size={16} /> თქვენი ხმა მნიშვნელოვანია
          </S.MadeWith>
        </S.Bottom>
      </S.Container>
    </S.FooterWrapper>
  );
};

export default ReferendumFooter;
