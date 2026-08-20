import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/shared/Header";
import { BoxIcon, ClipboardIcon, LockIcon, PeopleIcon, TagIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import * as S from "./style";

interface DashboardTabConfig {
  href: string;
  label: string;
  icon: React.FC<{ size?: number }>;
}

const TABS: DashboardTabConfig[] = [
  { href: "/dashboard/products", label: "პროდუქტები", icon: BoxIcon },
  { href: "/dashboard/category", label: "კატეგორიები", icon: TagIcon },
  { href: "/dashboard/orders", label: "შეკვეთები", icon: ClipboardIcon },
  { href: "/dashboard/users", label: "მომხმარებლები", icon: PeopleIcon },
];

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, headerAction, children }) => {
  const { isLoading, isDenied } = useAdminGuard();
  const router = useRouter();

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (isDenied) {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გესაჭიროებათ ადმინისტრატორის უფლებები.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  return (
    <>
      <Header />
      <S.PageWrapper>
        <S.Container>
          <S.Layout>
            {/* Menu Navigation */}
            <S.Sidebar>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = router.pathname === tab.href;
                return (
                  <Link key={tab.href} href={tab.href} passHref legacyBehavior>
                    <S.SidebarTab as="a" active={active}>
                      <Icon size={16} /> {tab.label}
                    </S.SidebarTab>
                  </Link>
                );
              })}
            </S.Sidebar>

            <S.MainColumn>
              {/* Page Header */}
              <S.HeaderSection>
                <S.TitleGroup>
                  <S.PageTitle>{title}</S.PageTitle>
                  <S.PageSubtitle>{subtitle}</S.PageSubtitle>
                </S.TitleGroup>
                {headerAction}
              </S.HeaderSection>

              {children}
            </S.MainColumn>
          </S.Layout>
        </S.Container>
      </S.PageWrapper>
    </>
  );
};

export default DashboardLayout;
