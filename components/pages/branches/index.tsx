import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { BranchesAPI } from "@/API_Client";
import { Branch, BranchWorkingHours } from "@/API_Client/types";
import { BRANCH_DAY_KEYS, BRANCH_DAY_LABELS, BranchDayKey } from "@/components/pages/dashboard/schemas";
import { MapPinIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// mapbox-gl ბრაუზერის window ობიექტს საჭიროებს — SSR-ზე გამორთვა აუცილებელია.
const BranchMap = dynamic(() => import("./BranchMap"), { ssr: false });

const jsDayToWeekDayKey = (jsDay: number): BranchDayKey => BRANCH_DAY_KEYS[(jsDay + 6) % 7];

const formatDayHours = (workingHours: BranchWorkingHours, day: BranchDayKey): string => {
  const hours = workingHours[day];
  return hours ? `${hours.open} - ${hours.close}` : "დახურული";
};

// "ფილიალები" გვერდი — ყველა აქტიური ფილიალი (BranchesAPI.branchesControllerFindAllForMap,
// pagination-ის გარეშე, ავტორიზაციის გარეშე) სიის + რუკის სახით. სიაში დაჭერა რუკაზე
// შესაბამის marker-ს გაასწორებს (flyTo), marker-ზე დაჭერა კი — პირიქით.
export const BranchesComponent: React.FC = () => {
  const { t } = useTranslation("branches");
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBranches = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await BranchesAPI(router.locale || "ka", "").branchesControllerFindAllForMap();
        const list = (res.data as unknown as Branch[]) || [];
        if (cancelled) return;
        setBranches(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBranches();
    return () => {
      cancelled = true;
    };
  }, [router.locale]);

  const todayKey = useMemo(() => jsDayToWeekDayKey(new Date().getDay()), []);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.PageHeader>
          <S.PageTitle>{t("page-title")}</S.PageTitle>
          <S.PageSubtitle>{t("page-subtitle")}</S.PageSubtitle>
        </S.PageHeader>

        {loading ? (
          <S.StateBox>{t("loading")}</S.StateBox>
        ) : error ? (
          <S.StateBox>{t("error")}</S.StateBox>
        ) : branches.length === 0 ? (
          <S.StateBox>{t("empty")}</S.StateBox>
        ) : (
          <S.Layout>
            <S.ListPanel>
              {branches.map((branch) => (
                <S.BranchCard
                  key={branch.id}
                  type="button"
                  $active={branch.id === selectedId}
                  onClick={() => setSelectedId(branch.id)}
                >
                  {/* {branch.company?.name && <S.BranchCardCompany>{branch.company.name}</S.BranchCardCompany>} */}
                  <S.BranchCardTitle>{branch.title}</S.BranchCardTitle>

                  <S.BranchCardRow>
                    <S.BranchCardRowIcon>
                      <MapPinIcon size={14} color="currentColor" />
                    </S.BranchCardRowIcon>
                    <span>{branch.address}</span>
                  </S.BranchCardRow>

                  <S.BranchCardRow>
                    <span>
                      {t("phone-label")}: {branch.phoneNumber}
                    </span>
                  </S.BranchCardRow>

                  {branch.email && (
                    <S.BranchCardRow>
                      <span>
                        {t("email-label")}: {branch.email}
                      </span>
                    </S.BranchCardRow>
                  )}

                  <S.HoursTable>
                    {BRANCH_DAY_KEYS.map((day) => (
                      <S.WorkingHoursRow key={day} $today={day === todayKey}>
                        <S.WorkingHoursDay>{BRANCH_DAY_LABELS[day]}</S.WorkingHoursDay>
                        <S.WorkingHoursHours>{formatDayHours(branch.workingHours, day)}</S.WorkingHoursHours>
                      </S.WorkingHoursRow>
                    ))}
                  </S.HoursTable>
                </S.BranchCard>
              ))}
            </S.ListPanel>

            <S.MapPanel>
              <BranchMap branches={branches} selectedId={selectedId} onSelectBranch={setSelectedId} />
            </S.MapPanel>
          </S.Layout>
        )}
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default BranchesComponent;
