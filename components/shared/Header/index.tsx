import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthModal from "@/components/shared/AuthModal";
import CartButton from "@/components/shared/CartButton";
import { useWishlist } from "@/context/Wishlist";
import {
  ChartIcon,
  ChevronDownIcon,
  ClipboardIcon,
  HeartIcon,
  KeyIcon,
  LogoutIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/RefIcons";
import * as S from "./style";

interface HeaderProps {
  onOpenAuth?: (mode?: "login" | "register" | "forgot") => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const query = searchValue.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
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
                <img src="/icons/logo.svg" alt="" />
              </S.LogoBadge>
            </S.LogoLink>
          </Link>

          <S.Nav>
            <Link href="/" passHref legacyBehavior>
              <S.NavLink active={router.pathname === "/"}>მთავარი</S.NavLink>
            </Link>
            <Link href="/products" passHref legacyBehavior>
              <S.NavLink active={router.pathname.startsWith("/products")}>კატალოგი</S.NavLink>
            </Link>
            <Link href="/orders" passHref legacyBehavior>
              <S.NavLink active={router.pathname.startsWith("/orders")} onClick={handleOrdersClick}>
                ჩემი შეკვეთები
              </S.NavLink>
            </Link>
          </S.Nav>

          <S.Actions ref={dropdownRef}>
            <S.SearchForm onSubmit={handleSearchSubmit}>
              <SearchIcon size={16} />
              <S.SearchInput
                type="text"
                placeholder="მოძებნეთ პროდუქტი…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </S.SearchForm>

            <S.WishlistButton
              type="button"
              onClick={() => router.push("/wishlist")}
              aria-label="სასურველი პროდუქტები"
              title="სასურველი პროდუქტები"
            >
              <HeartIcon size={20} filled={wishlistCount > 0} />
              {wishlistCount > 0 && <S.WishlistBadge>{wishlistCount > 99 ? "99+" : wishlistCount}</S.WishlistBadge>}
            </S.WishlistButton>

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
                        {session.user.name || "მომხმარებელი"}
                      </S.DropdownHeaderName>
                      <S.UserEmail>{session.user.email}</S.UserEmail>
                    </S.DropdownHeader>

                    {session.user.role?.toLowerCase() === "admin" && (
                      <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}>
                        <ChartIcon size={18} /> დეშბორდი
                      </S.DropdownItem>
                    )}

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/user/profile"); }}>
                      <UserIcon size={18} /> პროფილი
                    </S.DropdownItem>

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/orders"); }}>
                      <ClipboardIcon size={18} /> ჩემი შეკვეთები
                    </S.DropdownItem>

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/user/change-password"); }}>
                      <KeyIcon size={18} /> პაროლის შეცვლა
                    </S.DropdownItem>

                    <S.DropdownItem danger onClick={handleLogout}>
                      <LogoutIcon size={18} /> გამოსვლა
                    </S.DropdownItem>
                  </S.DropdownMenu>
                )}
              </>
            ) : (
              <S.LoginBtn onClick={() => handleOpenLogin("login")} type="button">
                <UserIcon size={18} /> შესვლა
                <S.LoginBtnFullLabel> / ავტორიზაცია</S.LoginBtnFullLabel>
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
