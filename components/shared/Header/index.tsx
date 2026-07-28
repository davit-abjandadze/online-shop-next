import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthModal from "@/components/shared/AuthModal";
import * as S from "./style";

interface HeaderProps {
  onOpenAuth?: (mode?: "login" | "register" | "forgot") => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    router.push("/");
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
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFo1sRXIAqzVIPar-o5_yM6ggVh95DaWkekcNbLjCg7g&s=10" alt="" />
                </S.LogoBadge>
              </S.LogoLink>
            </Link>
          </S.RightSection>
          <S.LeftSection ref={dropdownRef}>
            {status === "authenticated" && session?.user ? (
              <>
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
                  <span style={{ fontSize: "10px", color: "#65676B" }}>▼</span>
                </S.ProfileTrigger>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <S.DropdownMenu>
                    <S.DropdownHeader>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#050505" }}>
                        {session.user.name || "მომხმარებელი"}
                      </div>
                      <S.UserEmail>{session.user.email}</S.UserEmail>
                    </S.DropdownHeader>

                    {session.user.role?.toLowerCase() === "admin" && (
                      <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}>
                        📊 დეშბორდი
                      </S.DropdownItem>
                    )}

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/profile"); }}>
                      👤 პროფილი
                    </S.DropdownItem>

                    <S.DropdownItem onClick={() => { setDropdownOpen(false); router.push("/change-password"); }}>
                      🔑 პაროლის შეცვლა
                    </S.DropdownItem>

                    <S.DropdownItem danger onClick={handleLogout}>
                      🚪 გამოსვლა
                    </S.DropdownItem>
                  </S.DropdownMenu>
                )}
              </>
            ) : (
              <S.LoginBtn onClick={() => handleOpenLogin("login")} type="button">
                👤 შესვლა / ავტორიზაცია
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
