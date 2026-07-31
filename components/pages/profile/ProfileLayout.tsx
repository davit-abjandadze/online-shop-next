import React from "react";
import { useRouter } from "next/router";
import Header from "@/components/shared/Header";
import * as S from "./style";

type ProfileTab = "info" | "favorites" | "activities";

const TAB_ROUTES: Record<ProfileTab, string> = {
  info: "/user/profile",
  favorites: "/user/favorites",
  activities: "/user/activities",
};

interface ProfileLayoutProps {
  activeTab: ProfileTab;
  title: string;
  subtitle: string;
  favoritesCount?: number;
  activitiesCount?: number;
  children: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  activeTab,
  title,
  subtitle,
  favoritesCount,
  activitiesCount,
  children,
}) => {
  const router = useRouter();

  return (
    <>
      <Header />
      <S.PageWrapper>
        <S.Container>
          <S.HeaderSection>
            <S.PageTitle>{title}</S.PageTitle>
            <S.PageSubtitle>{subtitle}</S.PageSubtitle>
          </S.HeaderSection>

          <S.Layout>
            <S.Sidebar>
              <S.SidebarItem active={activeTab === "info"} onClick={() => router.push(TAB_ROUTES.info)}>
                🧑‍💼 პირადი ინფორმაცია
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "favorites"} onClick={() => router.push(TAB_ROUTES.favorites)}>
                ⭐ ფავორიტები {favoritesCount != null ? `(${favoritesCount})` : ""}
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "activities"} onClick={() => router.push(TAB_ROUTES.activities)}>
                🗂️ აქტივობები {activitiesCount != null ? `(${activitiesCount})` : ""}
              </S.SidebarItem>
            </S.Sidebar>

            <S.Content>{children}</S.Content>
          </S.Layout>
        </S.Container>
      </S.PageWrapper>
    </>
  );
};

export default ProfileLayout;
