import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { FavoritesAPI, UserAPI, UserAnswerAPI } from "@/API_Client";
import { PaginationMetaDto, Question, User, UserGenderEnum } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { ParsedResult, parseResultsData } from "@/utils/parseQuestionResults";
import * as S from "./style";

type ProfileTab = "info" | "favorites" | "activities";
const FAVORITES_PAGE_SIZE = 10;
const ACTIVITIES_PAGE_SIZE = 10;

export const ProfileComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>("info");

  // ─── User Info State ─────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<UserGenderEnum | "">("");
  const [savingUser, setSavingUser] = useState<boolean>(false);

  // ─── Favorites State ──────────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<Question[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);
  const [favoritesPage, setFavoritesPage] = useState<number>(1);
  const [favoritesMeta, setFavoritesMeta] = useState<PaginationMetaDto | null>(null);
  const [favoritingId, setFavoritingId] = useState<number | null>(null);

  // ─── Activities State ────────────────────────────────────────────────────────
  type ActivityItem = { question: Question; myAnswers: { id: number }[]; votedAt: string };
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [activitiesPage, setActivitiesPage] = useState<number>(1);
  const [activitiesMeta, setActivitiesMeta] = useState<PaginationMetaDto | null>(null);
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<Set<number>>(new Set());
  const [activityFavoritingId, setActivityFavoritingId] = useState<number | null>(null);

  // Voting state for favorited questions, mirroring the home page card
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [viewResultsSet, setViewResultsSet] = useState<Record<number, boolean>>({});
  const [questionResults, setQuestionResults] = useState<Record<number, ParsedResult>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [votedQuestionIds, setVotedQuestionIds] = useState<Set<number>>(new Set());

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

  const fetchSingleResults = async (q: Question) => {
    if (!session?.accessToken) return;
    try {
      const res = await UserAnswerAPI(router.locale || "ka", session.accessToken).userAnswerControllerGetResults(
        String(q.id)
      );
      const parsed = parseResultsData(res.data, q);
      setQuestionResults((prev) => ({ ...prev, [q.id]: parsed }));
    } catch (err) {
      console.log(`Could not fetch results for question ${q.id}:`, err);
    }
  };

  const fetchFavorites = async () => {
    if (!session?.accessToken) return;
    setLoadingFavorites(true);
    try {
      const res = await FavoritesAPI(
        router.locale || "ka",
        session.accessToken
      ).favoriteControllerFindMyFavorites(favoritesPage, FAVORITES_PAGE_SIZE);
      const data = res.data as any;
      const qList: Question[] = Array.isArray(data?.data) ? data.data : [];
      setFavorites(qList);
      setFavoritesMeta(data?.meta || null);

      qList.forEach((q) => fetchSingleResults(q));

      try {
        const votedRes = await UserAnswerAPI(
          router.locale || "ka",
          session.accessToken
        ).userAnswerControllerGetMyVotedQuestions();
        const votedIds: number[] = Array.isArray(votedRes.data) ? votedRes.data : [];
        setVotedQuestionIds(new Set(votedIds));
        if (votedIds.length > 0) {
          const newViewResults: Record<number, boolean> = {};
          votedIds.forEach((id) => { newViewResults[id] = true; });
          setViewResultsSet((prev) => ({ ...prev, ...newViewResults }));
        }
      } catch (err) {
        console.log("Could not fetch voted questions:", err);
      }
    } catch {
      toast.error("ფავორიტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchActivities = async () => {
    if (!session?.accessToken) return;
    setLoadingActivities(true);
    try {
      const res = await UserAnswerAPI(
        router.locale || "ka",
        session.accessToken
      ).userAnswerControllerGetMyActivities(activitiesPage, ACTIVITIES_PAGE_SIZE);
      const data = res.data as any;
      const items: ActivityItem[] = Array.isArray(data?.data) ? data.data : [];
      setActivities(items);
      setActivitiesMeta(data?.meta || null);

      items.forEach((item) => fetchSingleResults(item.question));

      try {
        // Backend caps `limit` at 100, so page through all favorites to collect every id
        const favoriteIds: number[] = [];
        let favPage = 1;
        let hasNext = true;
        while (hasNext) {
          const favoritesRes = await FavoritesAPI(
            router.locale || "ka",
            session.accessToken
          ).favoriteControllerFindMyFavorites(favPage, 100);
          const favData = favoritesRes.data as any;
          const favoritesData = favData?.data;
          if (Array.isArray(favoritesData)) {
            favoriteIds.push(...favoritesData.map((q: any) => q.id).filter((id: any) => id != null));
          }
          hasNext = !!favData?.meta?.hasNext;
          favPage += 1;
        }
        setFavoriteQuestionIds(new Set(favoriteIds));
      } catch (err) {
        console.log("Could not fetch favorite questions:", err);
      }
    } catch {
      toast.error("აქტივობების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleToggleFavoriteInActivities = async (question: Question) => {
    if (!session?.accessToken) return;
    const isFavorite = favoriteQuestionIds.has(question.id);
    setActivityFavoritingId(question.id);
    try {
      if (isFavorite) {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerRemoveFavorite(
          String(question.id)
        );
        setFavoriteQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(question.id);
          return next;
        });
      } else {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerAddFavorite(
          String(question.id)
        );
        setFavoriteQuestionIds((prev) => new Set(prev).add(question.id));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფავორიტების განახლება ვერ მოხერხდა");
    } finally {
      setActivityFavoritingId(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && activeTab === "favorites") {
      fetchFavorites();
    }
  }, [status, session, activeTab, favoritesPage]);

  useEffect(() => {
    if (status === "authenticated" && activeTab === "activities") {
      fetchActivities();
    }
  }, [status, session, activeTab, activitiesPage]);

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

  const handleSelectOption = (questionId: number, answerId: number, isMultiple: boolean) => {
    const current = selectedAnswers[questionId] || [];

    if (isMultiple) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: current.includes(answerId)
          ? current.filter((id) => id !== answerId)
          : [...current, answerId],
      });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: [answerId] });
    }
  };

  const handleVote = async (q: Question) => {
    if (!session?.accessToken) return;
    const chosen = selectedAnswers[q.id] || [];
    if (chosen.length === 0) {
      toast.warning("გთხოვთ აირჩიოთ მინიმუმ ერთი პასუხი");
      return;
    }

    setSubmittingId(q.id);
    try {
      await UserAnswerAPI(router.locale || "ka", session.accessToken).userAnswerControllerSubmitAnswer(
        { answerIds: chosen },
        String(q.id)
      );
      toast.success("თქვენი ხმა წარმატებით დარეგისტრირდა!");
      setVotedQuestionIds((prev) => new Set(prev).add(q.id));
      await fetchSingleResults(q);
      setViewResultsSet((prev) => ({ ...prev, [q.id]: true }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ხმის მიცემა ვერ მოხერხდა");
    } finally {
      setSubmittingId(null);
    }
  };

  const toggleResultsView = (q: Question) => {
    setViewResultsSet((prev) => {
      const isShowingResults = !!prev[q.id];
      if (!isShowingResults) {
        fetchSingleResults(q);
      }
      return { ...prev, [q.id]: !isShowingResults };
    });
  };

  const handleToggleFavorite = async (question: Question) => {
    if (!session?.accessToken) return;
    setFavoritingId(question.id);
    try {
      await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerRemoveFavorite(
        String(question.id)
      );
      toast.success("ფავორიტი წაიშალა");
      setFavorites((prev) => prev.filter((q) => q.id !== question.id));
      setFavoritesMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფავორიტის წაშლა ვერ მოხერხდა");
    } finally {
      setFavoritingId(null);
    }
  };

  return (
    <>
      <Header />
      <S.PageWrapper>
        <S.Container>
          <S.HeaderSection>
            <S.PageTitle>👤 პროფილი</S.PageTitle>
            <S.PageSubtitle>მართეთ თქვენი პირადი ინფორმაცია და ფავორიტი კითხვები</S.PageSubtitle>
          </S.HeaderSection>

          <S.Layout>
            {/* ═══ SIDEBAR MENU ═══════════════════════════════════════════════ */}
            <S.Sidebar>
              <S.SidebarItem active={activeTab === "info"} onClick={() => setActiveTab("info")}>
                🧑‍💼 პირადი ინფორმაცია
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")}>
                ⭐ ფავორიტები {favoritesMeta ? `(${favoritesMeta.total})` : ""}
              </S.SidebarItem>
              <S.SidebarItem active={activeTab === "activities"} onClick={() => setActiveTab("activities")}>
                🗂️ აქტივობები {activitiesMeta ? `(${activitiesMeta.total})` : ""}
              </S.SidebarItem>
            </S.Sidebar>

            <S.Content>
              {/* ═══ USER INFO TAB ═══════════════════════════════════════════ */}
              {activeTab === "info" && (
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
              )}

              {/* ═══ FAVORITES TAB ═══════════════════════════════════════════ */}
              {activeTab === "favorites" && (
                <>
                  <S.CardTitle>⭐ ფავორიტი კითხვები</S.CardTitle>

                  {loadingFavorites ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <p style={{ color: "#65676B" }}>იტვირთება...</p>
                    </div>
                  ) : favorites.length === 0 ? (
                    <S.EmptyState>
                      <span style={{ fontSize: "48px" }}>⭐</span>
                      <S.EmptyTitle>ფავორიტები არ არის დამატებული</S.EmptyTitle>
                      <S.EmptyText>დაამატეთ კითხვები ფავორიტებში მთავარი გვერდიდან.</S.EmptyText>
                      <S.ActionButton variant="primary" onClick={() => router.push("/")}>
                        🗳️ კითხვების ნახვა
                      </S.ActionButton>
                    </S.EmptyState>
                  ) : (
                    <S.FavoritesList>
                      {favorites.map((q) => {
                        const hasVoted = votedQuestionIds.has(q.id);
                        const isShowingResults = hasVoted || !!viewResultsSet[q.id];

                        return (
                          <QuestionCard
                            key={q.id}
                            question={q}
                            hasVoted={hasVoted}
                            isShowingResults={isShowingResults}
                            results={questionResults[q.id]}
                            chosenIds={selectedAnswers[q.id] || []}
                            submitting={submittingId === q.id}
                            isFavorite
                            favoriting={favoritingId === q.id}
                            onSelectOption={(answerId, isMultiple) => handleSelectOption(q.id, answerId, isMultiple)}
                            onVote={() => handleVote(q)}
                            onToggleResults={() => toggleResultsView(q)}
                            onToggleFavorite={() => handleToggleFavorite(q)}
                          />
                        );
                      })}
                    </S.FavoritesList>
                  )}

                  {favoritesMeta && favoritesMeta.totalPages > 1 && (
                    <S.PaginationBar>
                      <S.PageButton
                        onClick={() => setFavoritesPage((p) => Math.max(1, p - 1))}
                        disabled={!favoritesMeta.hasPrevious}
                      >
                        ← წინა
                      </S.PageButton>

                      <S.PageNumbers>
                        {getPaginationRange(favoritesMeta.page, favoritesMeta.totalPages).map((item, idx) =>
                          item === "..." ? (
                            <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
                          ) : (
                            <S.PageNumberButton
                              key={item}
                              active={item === favoritesMeta.page}
                              onClick={() => setFavoritesPage(item)}
                            >
                              {item}
                            </S.PageNumberButton>
                          )
                        )}
                      </S.PageNumbers>

                      <S.PageButton
                        onClick={() => setFavoritesPage((p) => p + 1)}
                        disabled={!favoritesMeta.hasNext}
                      >
                        შემდეგი →
                      </S.PageButton>
                    </S.PaginationBar>
                  )}
                </>
              )}

              {/* ═══ ACTIVITIES TAB ══════════════════════════════════════════ */}
              {activeTab === "activities" && (
                <>
                  <S.CardTitle>🗂️ ჩემი აქტივობები</S.CardTitle>

                  {loadingActivities ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <p style={{ color: "#65676B" }}>იტვირთება...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <S.EmptyState>
                      <span style={{ fontSize: "48px" }}>🗂️</span>
                      <S.EmptyTitle>აქტივობები არ არის</S.EmptyTitle>
                      <S.EmptyText>თქვენ ჯერ არ მიგიღიათ მონაწილეობა არცერთ გამოკითხვაში.</S.EmptyText>
                      <S.ActionButton variant="primary" onClick={() => router.push("/")}>
                        🗳️ კითხვების ნახვა
                      </S.ActionButton>
                    </S.EmptyState>
                  ) : (
                    <S.FavoritesList>
                      {activities.map(({ question: q, myAnswers }) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          hasVoted
                          isShowingResults
                          results={questionResults[q.id]}
                          chosenIds={myAnswers.map((a) => a.id)}
                          submitting={false}
                          isFavorite={favoriteQuestionIds.has(q.id)}
                          favoriting={activityFavoritingId === q.id}
                          onSelectOption={() => {}}
                          onVote={() => {}}
                          onToggleResults={() => {}}
                          onToggleFavorite={() => handleToggleFavoriteInActivities(q)}
                        />
                      ))}
                    </S.FavoritesList>
                  )}

                  {activitiesMeta && activitiesMeta.totalPages > 1 && (
                    <S.PaginationBar>
                      <S.PageButton
                        onClick={() => setActivitiesPage((p) => Math.max(1, p - 1))}
                        disabled={!activitiesMeta.hasPrevious}
                      >
                        ← წინა
                      </S.PageButton>

                      <S.PageNumbers>
                        {getPaginationRange(activitiesMeta.page, activitiesMeta.totalPages).map((item, idx) =>
                          item === "..." ? (
                            <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
                          ) : (
                            <S.PageNumberButton
                              key={item}
                              active={item === activitiesMeta.page}
                              onClick={() => setActivitiesPage(item)}
                            >
                              {item}
                            </S.PageNumberButton>
                          )
                        )}
                      </S.PageNumbers>

                      <S.PageButton
                        onClick={() => setActivitiesPage((p) => p + 1)}
                        disabled={!activitiesMeta.hasNext}
                      >
                        შემდეგი →
                      </S.PageButton>
                    </S.PaginationBar>
                  )}
                </>
              )}
            </S.Content>
          </S.Layout>
        </S.Container>
      </S.PageWrapper>
    </>
  );
};

export default ProfileComponent;
