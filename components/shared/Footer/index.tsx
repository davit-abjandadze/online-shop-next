import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { CartIcon, FacebookGlyphIcon, InstagramIcon, MailIcon, XIcon } from "@/components/ui/RefIcons";
import AuthModal from "@/components/shared/AuthModal";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import * as S from "./style";

const FOOTER_CATEGORIES_LIMIT = 5;

export const Footer: React.FC = () => {
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
      .categoryControllerFindAll()
      .then((res) => {
        const data = res.data as unknown as Category[];
        if (Array.isArray(data)) setCategories(data.slice(0, FOOTER_CATEGORIES_LIMIT));
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
    toast.info("სიახლეების გამოწერა მალე ხელმისაწვდომი იქნება");
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
              დაათვალიერეთ პროდუქტების კატალოგი და შეიძინეთ სწრაფი და უსაფრთხო შეკვეთით.
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
                <S.LinkColumnTitle>კატეგორიები</S.LinkColumnTitle>
                {categories.map((category) => (
                  <Link key={category.id} href={`/products?category=${category.id}`} passHref legacyBehavior>
                    <S.FooterLink>{category.name}</S.FooterLink>
                  </Link>
                ))}
              </S.LinkColumn>
            )}

            <S.LinkColumn>
              <S.LinkColumnTitle>მომსახურება</S.LinkColumnTitle>
              <Link href="/products" passHref legacyBehavior>
                <S.FooterLink>კატალოგი</S.FooterLink>
              </Link>
              <Link href="/user/profile" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>პროფილი</S.FooterLink>
              </Link>
              <Link href="/user/change-password" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>პაროლის შეცვლა</S.FooterLink>
              </Link>
              <Link href="/orders" passHref legacyBehavior>
                <S.FooterLink onClick={handleProtectedLinkClick}>ჩემი შეკვეთები</S.FooterLink>
              </Link>
              <Link href="/terms" passHref legacyBehavior>
                <S.FooterLink>წესები და პირობები</S.FooterLink>
              </Link>
            </S.LinkColumn>

            <S.LinkColumn>
              <S.LinkColumnTitle>სიახლეების გამოწერა</S.LinkColumnTitle>
              <S.NewsletterText>
                გამოიწერეთ სიახლეები ახალი კოლექციებისა და ფასდაკლებების შესახებ.
              </S.NewsletterText>
              <S.NewsletterForm onSubmit={handleNewsletterSubmit}>
                <MailIcon size={16} />
                <S.NewsletterInput
                  type="email"
                  required
                  placeholder="თქვენი ელფოსტა"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <S.NewsletterButton type="submit">გამოწერა</S.NewsletterButton>
              </S.NewsletterForm>
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
