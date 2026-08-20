import React from "react";
import { useRouter } from "next/router";
import Header from "@/components/shared/Header";
import { KeyIcon, UserIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

type ProfileTab = "info" | "password";

const TAB_ROUTES: Record<ProfileTab, string> = {
  info: "/user/profile",
  password: "/user/change-password",
};

interface ProfileLayoutProps {
  activeTab: ProfileTab;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  activeTab,
  title,
  subtitle,
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
