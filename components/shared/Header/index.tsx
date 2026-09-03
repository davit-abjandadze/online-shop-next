import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import AuthModal from "@/components/shared/AuthModal";
import CartButton from "@/components/shared/CartButton";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useWishlist } from "@/context/Wishlist";
import { ProductsAPI } from "@/API_Client";
import { PaginatedResponseDto, Product } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import {
  ChartIcon,
  ChevronDownIcon,
  ClipboardIcon,
  HeartIcon,
  KeyIcon,
  LogoutIcon,
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                      return (
                        <S.SuggestionItem
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product.id)}
                        >
                          <S.SuggestionImage>
                            {imageSrc ? <img src={imageSrc} alt={product.name} /> : <TagIcon size={20} />}
                          </S.SuggestionImage>
                          <S.SuggestionInfo>
                            <S.SuggestionName>{product.name}</S.SuggestionName>
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

            <LanguageSwitcher variant="header" />

            {status === "authenticated" && session?.user ? (
              <>
                <CartButton />
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
          </S.Actions>
        </S.Container>
      </S.HeaderWrapper>

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
