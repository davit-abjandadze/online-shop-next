import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CartIcon } from "@/components/ui/RefIcons";
import AuthModal from "@/components/shared/AuthModal";
import * as S from "./style";

export const Footer: React.FC = () => {
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
                დაათვალიერეთ პროდუქტების კატალოგი და შეიძინეთ სწრაფი და უსაფრთხო შეკვეთით.
              </S.BrandSubtitle>
            </S.BrandText>
          </S.Brand>

          <S.LinksGroup>
            <S.LinkColumn>
              <S.LinkColumnTitle>ნავიგაცია</S.LinkColumnTitle>
              <Link href="/" passHref legacyBehavior>
                <S.FooterLink>მთავარი</S.FooterLink>
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
              <Link href="/orders" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>ჩემი შეკვეთები</S.FooterLink>
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
          <S.Copyright>© {year} ონლაინ მაღაზია. ყველა უფლება დაცულია.</S.Copyright>
          <S.MadeWith>
            <CartIcon size={16} /> თქვენი შეძენა უსაფრთხოა
          </S.MadeWith>
        </S.Bottom>
      </S.Container>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </S.FooterWrapper>
  );
};

export default Footer;
