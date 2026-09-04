import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import AuthModal from "@/components/shared/AuthModal";
import CartButton from "@/components/shared/CartButton";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import CategoryFilterBar from "@/components/shared/CategoryFilterBar";
import { useWishlist } from "@/context/Wishlist";
import { ProductsAPI } from "@/API_Client";
import { PaginatedResponseDto, Product } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import { getCategoryName } from "@/utils/getCategoryName";
import {
  ChartIcon,
  ChevronDownIcon,
  ClipboardIcon,
  CloseIcon,
  HeartIcon,
  KeyIcon,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  TagIcon,
  UserIcon,
} from "@/components/ui/RefIcons";
import * as S from "./style";

// სერჩის საძებნო მოთხოვნების debounce ინტერვალი — ტაიპისას ყოველ
// სიმბოლოზე რექვესთი რომ არ გაეშვას.
const SEARCH_DEBOUNCE_MS = 350;
// dropdown-ში მაქსიმუმ ამდენი პროდუქტის მინიშნება გამოჩნდება.
const SUGGESTIONS_LIMIT = 6;

interface HeaderProps {
  onOpenAuth?: (mode?: "login" | "register" | "forgot") => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { t } = useTranslation("header");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  // მობაილის ბურგერ მენიუ — ნავიგაცია, ენა და კატეგორიების ფილტრი, რაც
  // ვიწრო ეკრანზე Header-ის მთავარი მწკრივიდან გატანილია (იხ. S.MobileMenuButton).
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // drawer-ს (ბექდროპთან ერთად) document.body-ში ვპორტალავთ — HeaderWrapper-ს
  // `backdrop-filter` აქვს, რაც `position: fixed`-ის containing block-ს
  // HeaderWrapper-ის საკუთარ (76px სიმაღლის) ბლოკზე ზღუდავს viewport-ის
  // ნაცვლად, ამიტომ drawer-იც ბოლომდე ვერ იწელებოდა და კონტენტს ეფარებოდა.
  // createPortal SSR-ზე `document` არ არსებობს — `mounted`-ით ვიცავთ.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // ღილაკიც ცალკე ref-ითაა (და არა mobileMenuRef-ის შიგნით), რადგან პანელი
  // Actions-ის გარეთაა — outside-click ჰენდლერს ორივეზე ცალკე უნდა შემოწმება,
  // თორემ თავად ღილაკზე დაჭერისას mousedown ჯერ დახურავს პანელს, click-ის
  // toggle-ი კი მაშინვე ისევ გახსნის.
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  // ბოლო გაგზავნილი მოთხოვნის id — pending პასუხებიდან მხოლოდ ბოლოს
  // ვითვალისწინებთ (თუ საძიებო ველი მანამდე კიდევ შეიცვალა).
  const searchRequestIdRef = useRef(0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
      const target = event.target as Node;
      const clickedInsideMobileMenu =
        (mobileMenuRef.current && mobileMenuRef.current.contains(target)) ||
        (mobileMenuButtonRef.current && mobileMenuButtonRef.current.contains(target));
      if (!clickedInsideMobileMenu) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // გვერდის შეცვლისას ბურგერ მენიუ თავისით იხურება.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  // Drawer-ის ღიაობისას ფონის სქროლი იბლოკება — თორემ drawer-ის შიგნით
  // სქროლვისას უკნიდან გვერდიც ერთდროულად იძვრებოდა.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // საძიებო მინიშნებების ჩატვირთვა — debounce-ით, რომ ტაიპისას ყოველ
  // სიმბოლოზე ცალკე რექვესთი არ გაიგზავნოს. ძებნა ერთდროულად ქართულ და
  // ინგლისურ დასახელებებზეც მუშაობს, ბექენდის `search` პარამეტრი name/description
  // ველებში ILIKE-ით ეძებს — მიუხედავად იმისა, რომელი ენით არის ჩაწერილი.
  useEffect(() => {
    const query = searchValue.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    const requestId = ++searchRequestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const res = await ProductsAPI(router.locale || "ka", "").productsControllerFindAll(
          1,
          SUGGESTIONS_LIMIT,
          undefined,
          undefined,
          query,
          undefined,
          undefined,
          undefined,
          true
        );
        // ტაიპისას შუალედში კიდევ შეიცვალა ველი — ამ პასუხს ვიგნორებთ.
        if (requestId !== searchRequestIdRef.current) return;
        const data = res.data as unknown as PaginatedResponseDto<Product>;
        setSuggestions(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        if (requestId === searchRequestIdRef.current) {
          console.error("Error fetching search suggestions:", err);
          setSuggestions([]);
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setSuggestionsLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchValue, router.locale]);

  const handleOpenLogin = (mode: "login" | "register" | "forgot" = "login") => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setAuthMode(mode);
      setAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut({ redirect: false });
    window.location.replace("/")
  };

  // ორდერების ბმული ავტორიზაციას მოითხოვს — არაავტორიზებულს ავტორიზაციის
  // მოდალს ვუხსნით ნავიგაციის ნაცვლად (იგივე პატერნი, რაც Footer-ს აქვს).
  const handleOrdersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status !== "authenticated") {
      e.preventDefault();
      handleOpenLogin("login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    const query = searchValue.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const handleSuggestionClick = (productId: number) => {
    setSuggestionsOpen(false);
    router.push(`/products/${productId}`);
  };

  // Get User Initials
  const getUserInitials = () => {
    if (!session?.user) return "U";
    const name = session.user.name || session.user.email || "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <S.HeaderWrapper>
        <S.Container>
          <Link href="/" passHref legacyBehavior>
            <S.LogoLink>
              <S.LogoBadge>
                <img src="/icons/logo.png" alt="" />
              </S.LogoBadge>
            </S.LogoLink>
          </Link>

          <S.Nav>
            <Link href="/" passHref legacyBehavior>
              <S.NavLink active={router.pathname === "/"}>{t("nav-home")}</S.NavLink>
            </Link>
            <Link href="/products" passHref legacyBehavior>
              <S.NavLink active={router.pathname.startsWith("/products")}>{t("nav-catalog")}</S.NavLink>
            </Link>
            <Link href="/orders" passHref legacyBehavior>
              <S.NavLink active={router.pathname.startsWith("/orders")} onClick={handleOrdersClick}>
                {t("nav-orders")}
              </S.NavLink>
            </Link>
          </S.Nav>

          <S.Actions ref={dropdownRef}>
            <S.SearchWrapper ref={searchRef}>
              <S.SearchForm onSubmit={handleSearchSubmit}>
                <SearchIcon size={16} />
                <S.SearchInput
                  type="text"
                  placeholder={t("search-placeholder")}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSuggestionsOpen(true)}
                />
              </S.SearchForm>

              {suggestionsOpen && searchValue.trim() && (
                <S.SuggestionsDropdown>
                  {suggestionsLoading ? (
                    <S.SuggestionsStatus>{t("search-loading")}</S.SuggestionsStatus>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((product) => {
                      const image = product.images?.[0];
                      const imageSrc = image
                        ? image.startsWith("http")
                          ? image
                          : `${CDN_URL}${image}`
                        : undefined;
                      const { price: displayPrice, originalPrice: oldPrice } = getDiscountedPrice(product);
                      const productName = getCategoryName(product, router.locale);
                      return (
                        <S.SuggestionItem
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product.id)}
                        >
                          <S.SuggestionImage>
                            {imageSrc ? <img src={imageSrc} alt={productName} /> : <TagIcon size={20} />}
                          </S.SuggestionImage>
                          <S.SuggestionInfo>
                            <S.SuggestionName>{productName}</S.SuggestionName>
                            <S.SuggestionPriceGroup>
                              <S.SuggestionPrice>{displayPrice.toFixed(2)} ₾</S.SuggestionPrice>
                              {oldPrice && <S.SuggestionOldPrice>{oldPrice.toFixed(2)} ₾</S.SuggestionOldPrice>}
                            </S.SuggestionPriceGroup>
                          </S.SuggestionInfo>
                        </S.SuggestionItem>
                      );
                    })
                  ) : (
                    <S.SuggestionsStatus>{t("search-no-results")}</S.SuggestionsStatus>
                  )}
                </S.SuggestionsDropdown>
              )}
            </S.SearchWrapper>

            <S.WishlistButton
              type="button"
              onClick={() => router.push("/wishlist")}
              aria-label={t("wishlist-aria-label")}
              title={t("wishlist-aria-label")}
            >
              <HeartIcon size={20} filled={wishlistCount > 0} />
              {wishlistCount > 0 && <S.WishlistBadge>{wishlistCount > 99 ? "99+" : wishlistCount}</S.WishlistBadge>}
            </S.WishlistButton>

            {/* დესკტოპზე ენის გადამრთველი აქვე ჩანს, მობაილზე კი ბურგერ მენიუშია
                გატანილი (იხ. S.DesktopLanguageSwitcher/S.MobileMenuButton) —
                ვიწრო ეკრანზე ორივეს ჩვენება ადგილს ართმევდა ლოგოსა და
                კალათის/პროფილის ხატულებს. */}
        
            {status === "authenticated" && session?.user && (
                <CartButton />
            )}
            <S.DesktopLanguageSwitcher>
              <LanguageSwitcher variant="header" />
            </S.DesktopLanguageSwitcher>
            {status === "authenticated" && session?.user ? (
              <>
                <S.ProfileTrigger
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  type="button"
                >
                  <S.AvatarCircle>
                    {getUserInitials()}
                  </S.AvatarCircle>
                
                  <ChevronDownIcon size={14} />
                </S.ProfileTrigger>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <S.DropdownMenu>
                    <S.DropdownHeader>
                      <S.DropdownHeaderName>
                        {session.user.name || t("profile-menu-default-name")}
                      </S.DropdownHeaderName>
                      <S.UserEmail>{session.user.email}</S.UserEmail>
                    </S.DropdownHeader>

                    {session.user.role?.toLowerCase() === "admin" && (
                      <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}>
                        <ChartIcon size={18} /> {t("profile-menu-dashboard")}
                      </S.DropdownItem>
                    )}

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/user/profile"); }}>
                      <UserIcon size={18} /> {t("profile-menu-profile")}
                    </S.DropdownItem>

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/orders"); }}>
                      <ClipboardIcon size={18} /> {t("profile-menu-orders")}
                    </S.DropdownItem>

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/user/change-password"); }}>
                      <KeyIcon size={18} /> {t("profile-menu-change-password")}
                    </S.DropdownItem>

                    <S.DropdownItem danger onClick={handleLogout}>
                      <LogoutIcon size={18} /> {t("profile-menu-logout")}
                    </S.DropdownItem>
                  </S.DropdownMenu>
                )}
              </>
            ) : (
              <S.LoginBtn onClick={() => handleOpenLogin("login")} type="button">
                <UserIcon size={18} /> {t("login-cta")}
                <S.LoginBtnFullLabel> {t("login-cta-suffix")}</S.LoginBtnFullLabel>
              </S.LoginBtn>
            )}

            {/* ბურგერ მენიუს ღილაკი — მხოლოდ მობაილზე ჩანს (იხ. S.MobileMenuButton),
                შიგნით ნავიგაცია, ენა და კატეგორიების ფილტრია. */}
            <S.MobileMenuButton
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={t("mobile-menu-aria-label")}
              aria-expanded={mobileMenuOpen}
              open={mobileMenuOpen}
            >
              <MenuIcon size={22} />
            </S.MobileMenuButton>
          </S.Actions>
        </S.Container>

        {/* დესკტოპზე კატეგორიების დროპდაუნ-ზოლი ჰედერშივეა ჩაშენებული — აქამდე
            ცალკეულ გვერდებზე (home/catalog/categoryProducts) იყო დუბლირებული.
            HeaderWrapper-ის შიგნითაა (და არა ცალკე sticky-ით), რომ სქროლისას
            მთელი ჰედერი ერთ ბლოკად რჩებოდეს ზემოთ — ცალკე რომ ყოფილიყო,
            HeaderWrapper-ის sticky-ს ქვემოთ სქროლთან ერთად გაიჭრებოდა.
            თავად CategoryFilterBar 960px-ზე დაბლა თავს მალავს (იხ.
            components/shared/CategoryFilterBar/style.ts) — მობაილზე ბურგერ
            მენიუშია (S.MobileMenuFilterWrapper ზემოთ). */}
        <CategoryFilterBar />
      </S.HeaderWrapper>

      {/* ბექდროპი+drawer document.body-ში პორტალდება (იხ. `mounted`-ის კომენტარი
          ზემოთ) — თორემ HeaderWrapper-ის `backdrop-filter`-ის გამო `position: fixed`
          viewport-ის ნაცვლად თავად HeaderWrapper-ის (76px) ბლოკს დაემორჩილებოდა. */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <>
            {/* მინის ბუნდოვანი ფონი — drawer-ის მარცხნივ დარჩენილი ეკრანის ნაწილი
                (~20%) ისევ ჩანს, უბრალოდ დაბლურულია/დაბნელებული. */}
            <S.MobileMenuBackdrop
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
            />
            <S.MobileMenuPanel ref={mobileMenuRef}>
              <S.MobileMenuHeader>
                <S.MobileMenuTitle>{t("mobile-menu-aria-label")}</S.MobileMenuTitle>
                <S.MobileMenuCloseButton
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("mobile-menu-close-aria-label")}
                >
                  <CloseIcon size={18} />
                </S.MobileMenuCloseButton>
              </S.MobileMenuHeader>

              <S.MobileMenuBody>
                <S.MobileMenuSection>
                  <S.MobileMenuSectionLabel>{t("mobile-menu-search-label")}</S.MobileMenuSectionLabel>
                  <S.MobileMenuSearchWrapper>
                    <S.MobileMenuSearchForm onSubmit={handleSearchSubmit}>
                      <SearchIcon size={16} />
                      <S.MobileMenuSearchInput
                        type="text"
                        placeholder={t("search-placeholder")}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setSuggestionsOpen(true)}
                      />
                    </S.MobileMenuSearchForm>

                    {suggestionsOpen && searchValue.trim() && (
                      <S.MobileMenuSuggestionsDropdown>
                        {suggestionsLoading ? (
                          <S.SuggestionsStatus>{t("search-loading")}</S.SuggestionsStatus>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((product) => {
                            const image = product.images?.[0];
                            const imageSrc = image
                              ? image.startsWith("http")
                                ? image
                                : `${CDN_URL}${image}`
                              : undefined;
                            const { price: displayPrice, originalPrice: oldPrice } = getDiscountedPrice(product);
                            const productName = getCategoryName(product, router.locale);
                            return (
                              <S.SuggestionItem
                                key={product.id}
                                type="button"
                                onClick={() => handleSuggestionClick(product.id)}
                              >
                                <S.SuggestionImage>
                                  {imageSrc ? <img src={imageSrc} alt={productName} /> : <TagIcon size={20} />}
                                </S.SuggestionImage>
                                <S.SuggestionInfo>
                                  <S.SuggestionName>{productName}</S.SuggestionName>
                                  <S.SuggestionPriceGroup>
                                    <S.SuggestionPrice>{displayPrice.toFixed(2)} ₾</S.SuggestionPrice>
                                    {oldPrice && <S.SuggestionOldPrice>{oldPrice.toFixed(2)} ₾</S.SuggestionOldPrice>}
                                  </S.SuggestionPriceGroup>
                                </S.SuggestionInfo>
                              </S.SuggestionItem>
                            );
                          })
                        ) : (
                          <S.SuggestionsStatus>{t("search-no-results")}</S.SuggestionsStatus>
                        )}
                      </S.MobileMenuSuggestionsDropdown>
                    )}
                  </S.MobileMenuSearchWrapper>
                </S.MobileMenuSection>

                <S.MobileMenuSection>
                  <S.MobileMenuSectionLabel>{t("mobile-menu-filter-label")}</S.MobileMenuSectionLabel>
                  <S.MobileMenuFilterWrapper>
                    <CategoryFilterBar layout="vertical" />
                  </S.MobileMenuFilterWrapper>
                </S.MobileMenuSection>

                <S.MobileMenuSection>
                  <S.MobileMenuSectionLabel>{t("mobile-menu-language-label")}</S.MobileMenuSectionLabel>
                  <LanguageSwitcher variant="mobile-inline" />
                </S.MobileMenuSection>
              </S.MobileMenuBody>
            </S.MobileMenuPanel>
          </>,
          document.body
        )}

      {/* 3-in-1 Unified Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
