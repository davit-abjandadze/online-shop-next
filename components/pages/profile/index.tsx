import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import { UserAPI } from "@/API_Client";
import { User, UserGenderEnum } from "@/API_Client/client/models";
import { ProfileLayout } from "./ProfileLayout";
import * as S from "./style";

export const ProfileComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<UserGenderEnum | "">("");
  const [savingUser, setSavingUser] = useState<boolean>(false);

  const fetchUser = async () => {
    if (!session?.accessToken || !session?.user?.id) return;
    setLoadingUser(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(session.user.id);
      const u = res.data;
      setUser(u);
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setEmail(u.email || "");
      setGender((u.gender as UserGenderEnum) || "");
    } catch {
      toast.error("მომხმარებლის ინფორმაციის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, session]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "#65676B" }}>იტვირთება...</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <span style={{ fontSize: "48px" }}>🔒</span>
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  const getUserInitials = () => {
    const fn = firstName || user?.firstName || "";
    const ln = lastName || user?.lastName || "";
    if (fn || ln) return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "U";
    const name = session?.user?.name || session?.user?.email || "";
    return name.slice(0, 2).toUpperCase() || "U";
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !session?.user?.id) return;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.warning("გთხოვთ შეავსოთ სახელი, გვარი და ელფოსტა");
      return;
    }

    setSavingUser(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          gender: gender ? (gender as any) : undefined,
        },
        session.user.id
      );
      setUser(res.data);
      toast.success("პროფილი წარმატებით განახლდა!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროფილის განახლება ვერ მოხერხდა");
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <ProfileLayout
      activeTab="info"
      title="👤 პროფილი"
      subtitle="მართეთ თქვენი პირადი ინფორმაცია და ფავორიტი კითხვები"
    >
      <S.Card>
        <S.ProfileSummary>
          <S.AvatarCircle>{getUserInitials()}</S.AvatarCircle>
          <div>
            <S.ProfileName>
              {(user?.firstName || firstName) ? `${firstName || user?.firstName} ${lastName || user?.lastName}` : session?.user?.name || session?.user?.email}
            </S.ProfileName>
            <S.ProfileEmail>{email || session?.user?.email}</S.ProfileEmail>
            {user?.role && <S.Badge variant="role">{user.role === "admin" ? "🛡️ ადმინისტრატორი" : "👤 მომხმარებელი"}</S.Badge>}
            {user?.createdAt && (
              <S.Badge variant="date" style={{ marginLeft: "8px" }}>
                📅 რეგისტრირებულია {new Date(user.createdAt).toLocaleDateString("ka-GE")}
              </S.Badge>
            )}
          </div>
        </S.ProfileSummary>

        {loadingUser ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#65676B" }}>იტვირთება...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveUser}>
            <S.FormGrid>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>ელფოსტა</S.Label>
                <S.Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სქესი (არასავალდებულო)</S.Label>
                <S.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as UserGenderEnum | "")}
                >
                  <option value="">— მითითებული არ არის —</option>
                  <option value={UserGenderEnum.Male}>მამრობითი</option>
                  <option value={UserGenderEnum.Female}>მდედრობითი</option>
                </S.Select>
              </S.FormGroup>
            </S.FormGrid>

            <S.FormFooter>
              <S.ActionButton type="submit" variant="primary" disabled={savingUser}>
                {savingUser ? "ინახება..." : "ცვლილებების შენახვა"}
              </S.ActionButton>
            </S.FormFooter>
          </form>
        )}
      </S.Card>
    </ProfileLayout>
  );
};

export default ProfileComponent;
