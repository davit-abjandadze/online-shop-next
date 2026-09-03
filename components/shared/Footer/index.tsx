import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import { CartIcon, FacebookGlyphIcon, InstagramIcon, MailIcon, XIcon } from "@/components/ui/RefIcons";
import AuthModal from "@/components/shared/AuthModal";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { CategoriesAPI } from "@/API_Client";
import { Category, PaginatedResponseDto } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

const FOOTER_CATEGORIES_LIMIT = 5;

export const Footer: React.FC = () => {
  const { t } = useTranslation("footer");
  const year = new Date().getFullYear();
  const router = useRouter();
  const { status } = useSession();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // ავტორიზაციის მოთხოვნით დაცული ბმულები — თუ მომხმარებელი შესული არ არის,
  // ნავიგაციის ნაცვლად ავტორიზაციის მოდალი გაიხსნება.
  const handleProtectedLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status !== "authenticated") {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  useEffect(() => {
    CategoriesAPI(router.locale || "ka", "")
      .categoryControllerFindAll(1, FOOTER_CATEGORIES_LIMIT)
      .then((res) => {
        const data = res.data as unknown as PaginatedResponseDto<Category>;
        if (Array.isArray(data?.data)) setCategories(data.data);
      })
      .catch(() => {
        // კატეგორიების ბმულები არასავალდებულოა Footer-ისთვის — ჩუმად ვტოვებთ
      });
  }, [router.locale]);

  // Newsletter გამოწერისთვის backend-ს ჯერ არ აქვს endpoint — ამიტომ ნამდვილი
  // გამოწერის ნაცვლად პატიოსნად ვატყობინებთ, რომ ფუნქცია მალე ჩაირთვება,
  // ცრუ "წარმატებული გამოწერის" შეტყობინების გაგზავნის ნაცვლად.
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.info(t("footer-newsletter-toast") as string);
    setNewsletterEmail("");
  };

  return (
    <S.FooterWrapper>
      <S.Container>
        <S.Top>
          <S.BrandColumn>
            <S.Brand>
              <S.BrandBadge>
                <img src="/icons/logo.svg" alt="" />
              </S.BrandBadge>
            </S.Brand>
            <S.BrandSubtitle>
              {t("footer-brand-subtitle")}
            </S.BrandSubtitle>
            {/* სოციალური ქსელების ბეჯები დეკორატიულია — ანგარიშების დაკავშირებამდე
                რეალურ ბმულებზე არ მივყავართ, რომ არ ავამაღლოთ ცრუ მოლოდინი. */}
            <S.SocialRow>
              <S.SocialBadge title="Instagram"><InstagramIcon size={16} /></S.SocialBadge>
              <S.SocialBadge title="Facebook"><FacebookGlyphIcon size={16} /></S.SocialBadge>
              <S.SocialBadge title="X"><XIcon size={14} /></S.SocialBadge>
            </S.SocialRow>
          </S.BrandColumn>

          <S.LinksGroup>
            {categories.length > 0 && (
              <S.LinkColumn>
                <S.LinkColumnTitle>{t("footer-categories-heading")}</S.LinkColumnTitle>
                {categories.map((category) => (
                  <Link key={category.id} href={`/products?category=${category.id}`} passHref legacyBehavior>
                    <S.FooterLink>{getCategoryName(category, router.locale)}</S.FooterLink>
                  </Link>
                ))}
              </S.LinkColumn>
            )}

            <S.LinkColumn>
              <S.LinkColumnTitle>{t("footer-service-heading")}</S.LinkColumnTitle>
              <Link href="/products" passHref legacyBehavior>
                <S.FooterLink>{t("footer-link-catalog")}</S.FooterLink>
              </Link>
              <Link href="/user/profile" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>{t("footer-link-profile")}</S.FooterLink>
              </Link>
              <Link href="/user/change-password" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>{t("footer-link-change-password")}</S.FooterLink>
              </Link>
              <Link href="/orders" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>{t("footer-link-orders")}</S.FooterLink>
              </Link>
              <Link href="/terms" passHref legacyBehavior>
                <S.FooterLink>{t("footer-link-terms")}</S.FooterLink>
              </Link>
            </S.LinkColumn>

            <S.LinkColumn>
              <S.LinkColumnTitle>{t("footer-newsletter-heading")}</S.LinkColumnTitle>
              <S.NewsletterText>
                {t("footer-newsletter-text")}
              </S.NewsletterText>
              <S.NewsletterForm onSubmit={handleNewsletterSubmit}>
                <MailIcon size={16} />
                <S.NewsletterInput
                  type="email"
                  required
                  placeholder={t("footer-newsletter-placeholder")}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <S.NewsletterButton type="submit">{t("footer-newsletter-button")}</S.NewsletterButton>
              </S.NewsletterForm>
            </S.LinkColumn>
          </S.LinksGroup>
        </S.Top>

        <S.Bottom>
          <S.Copyright>{t("footer-copyright", { year })}</S.Copyright>
          <LanguageSwitcher variant="footer" />
          <S.MadeWith>
            <CartIcon size={16} /> {t("footer-made-with")}
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
