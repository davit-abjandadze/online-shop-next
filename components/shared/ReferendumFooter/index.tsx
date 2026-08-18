import React, { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { BallotIcon } from "@/components/ui/RefIcons";
import AuthModal from "@/components/shared/AuthModal";
import * as S from "./style";

export const ReferendumFooter: React.FC = () => {
  const year = new Date().getFullYear();
  const { status } = useSession();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ავტორიზაციის მოთხოვნით დაცული ბმულები — თუ მომხმარებელი შესული არ არის,
  // ნავიგაციის ნაცვლად ავტორიზაციის მოდალი გაიხსნება.
  const handleProtectedLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status !== "authenticated") {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <S.FooterWrapper>
      <S.Container>
        <S.Top>
          <S.Brand>
            <S.BrandBadge />
            <S.BrandText>
              <S.BrandTitle></S.BrandTitle>
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
                <S.FooterLink onClick={handleProtectedLinkClick}>ფავორიტები</S.FooterLink>
              </Link>
              <Link href="/user/activities" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>აქტივობები</S.FooterLink>
              </Link>
            </S.LinkColumn>

            <S.LinkColumn>
              <S.LinkColumnTitle>ანგარიში</S.LinkColumnTitle>
              <Link href="/user/profile" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>პროფილი</S.FooterLink>
              </Link>
              <Link href="/user/change-password" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>პაროლის შეცვლა</S.FooterLink>
              </Link>
            </S.LinkColumn>

            <S.LinkColumn>
              <S.LinkColumnTitle>სამართლებრივი</S.LinkColumnTitle>
              <Link href="/terms" passHref legacyBehavior>
                <S.FooterLink>წესები და პირობები</S.FooterLink>
              </Link>
            </S.LinkColumn>
          </S.LinksGroup>
        </S.Top>

        <S.Bottom>
          <S.Copyright>© {year} საზოგადოებრივი აზრის პლატფორმა. ყველა უფლება დაცულია.</S.Copyright>
          <S.MadeWith>
            <BallotIcon size={16} /> თქვენი ხმა მნიშვნელოვანია
          </S.MadeWith>
        </S.Bottom>

        {/* top.ge სტატისტიკის მთვლელი */}
        <S.CounterWrapper>
          <div id="top-ge-counter-container" data-site-id="118906" />
        </S.CounterWrapper>
      </S.Container>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />

      <Script src="//counter.top.ge/counter.js" strategy="lazyOnload" />
    </S.FooterWrapper>
  );
};

export default ReferendumFooter;
