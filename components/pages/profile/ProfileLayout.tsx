import React from "react";
import { useRouter } from "next/router";
import Header from "@/components/shared/Header";
import { ClipboardIcon, KeyIcon, QuestionMarkIcon, StarIcon, UserIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

type ProfileTab = "info" | "favorites" | "activities" | "myQuestions" | "password";

const TAB_ROUTES: Record<ProfileTab, string> = {
  info: "/user/profile",
  favorites: "/user/favorites",
  activities: "/user/activities",
  myQuestions: "/user/my-questions",
  password: "/user/change-password",
};

interface ProfileLayoutProps {
  activeTab: ProfileTab;
  title: string;
  subtitle: string;
  favoritesCount?: number;
  activitiesCount?: number;
  myQuestionsCount?: number;
  children: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  activeTab,
  title,
  subtitle,
  favoritesCount,
  activitiesCount,
  myQuestionsCount,
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
                <UserIcon size={18} /> პირადი ინფორმაცია
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "favorites"} onClick={() => router.push(TAB_ROUTES.favorites)}>
                <StarIcon size={18} filled /> ფავორიტები {favoritesCount != null ? `(${favoritesCount})` : ""}
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "activities"} onClick={() => router.push(TAB_ROUTES.activities)}>
                <ClipboardIcon size={18} /> აქტივობები {activitiesCount != null ? `(${activitiesCount})` : ""}
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "myQuestions"} onClick={() => router.push(TAB_ROUTES.myQuestions)}>
                <QuestionMarkIcon size={18} /> ჩემი დასმული კითხვები {myQuestionsCount != null ? `(${myQuestionsCount})` : ""}
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "password"} onClick={() => router.push(TAB_ROUTES.password)}>
                <KeyIcon size={18} /> პაროლის შეცვლა
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
