import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthModal from "@/components/shared/AuthModal";
import CartButton from "@/components/shared/CartButton";
import { useThemeMode } from "@/context/ThemeMode";
import { ChartIcon, ChevronDownIcon, ClipboardIcon, KeyIcon, LogoutIcon, MoonIcon, SunIcon, UserIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface HeaderProps {
  onOpenAuth?: (mode?: "login" | "register" | "forgot") => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          {/* მარცხნივ (Left Side): პროფილის სურათი ან შესვლის ღილაკი */}
          {/* მარჯვნივ (Right Side): ლოგო */}
          <S.RightSection>
            <Link href="/" passHref legacyBehavior>
              <S.LogoLink>
                <S.LogoBadge>
                  <img src="/icons/logo.svg" alt="" />
                </S.LogoBadge>
              </S.LogoLink>
            </Link>
          </S.RightSection>
          <S.LeftSection ref={dropdownRef}>
            <S.ThemeToggleButton
              type="button"
              onClick={toggleMode}
              aria-label={mode === "dark" ? "ღია რეჟიმზე გადართვა" : "ბნელ რეჟიმზე გადართვა"}
              title={mode === "dark" ? "ღია რეჟიმი" : "ბნელი რეჟიმი"}
            >
              {mode === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </S.ThemeToggleButton>

            {status === "authenticated" && session?.user ? (
              <>
                <CartButton />
                <S.ProfileTrigger
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  type="button"
                >
                  <S.AvatarCircle>
                    {/* {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || "User"} />
                    ) : ( */}
                    {getUserInitials()}
                    {/* )} */}
                  </S.AvatarCircle>
                  <S.ProfileName>
                    {session.user.name || session.user.email}
                  </S.ProfileName>
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
                <UserIcon size={18} style={{ filter: "brightness(0) invert(1)" }} /> შესვლა
                <S.LoginBtnFullLabel> / ავტორიზაცია</S.LoginBtnFullLabel>
              </S.LoginBtn>
            )}
          </S.LeftSection>
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
