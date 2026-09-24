import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CompaniesAPI, StatsAPI } from "@/API_Client";
import {
  BranchSalesDto,
  Company,
  CustomerLoyaltyDto,
  DashboardOverviewDto,
  OrderStatusBreakdownDto,
  PaymentStatsDto,
  ProductStatDto,
  RevenueOverTimeDto,
  StatusTransitionAvgDto,
  UserSignupsDto,
} from "@/API_Client/client/models";
import {
  StatsControllerGetLowStockProductsOrderEnum,
  StatsControllerGetTopSellingProductsOrderEnum,
  StatsControllerGetTopSellingProductsSortByEnum,
} from "@/API_Client/client/apis/stats-api";
import { PaginatedResponseDto } from "@/API_Client/types";
import { CartIcon, ChartIcon, CloseIcon, UserIcon, WarningIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { BranchSalesTable } from "./BranchSalesTable";
import { CustomerLoyaltyCard } from "./CustomerLoyaltyCard";
import { DateRangePicker, DateRangeValue } from "./DateRangePicker";
import DashboardLayout from "./DashboardLayout";
import { LowStockProduct, LowStockProductsTable } from "./LowStockProductsTable";
import { OrderStatusChart } from "./OrderStatusChart";
import { PaymentStatsChart } from "./PaymentStatsChart";
import { RevenueChart } from "./RevenueChart";
import { StatsSkeleton } from "./Skeletons";
import * as S from "./style";
import { StatsWidgetState } from "./StatsWidgetState";
import { TopSellingProductsChart } from "./TopSellingProductsChart";
import { TransitionTimesTable } from "./TransitionTimesTable";
import { UserSignupsChart } from "./UserSignupsChart";

const LOW_STOCK_PAGE_SIZE = 10;

const formatCurrency = (value: number) => `${value.toFixed(2)} ₾`;

// F1 ფაზა — API კლიენტი, route protection და თარიღების არჩევის საერთო
// კომპონენტი. F2 ფაზა — overview stat cards (`GET /stats/overview`). F3 ფაზა —
// შემოსავლის time-series გრაფიკი (`GET /stats/revenue`). F4 ფაზა — შეკვეთების
// სტატუსების ანალიტიკა (status-breakdown/transition-times). F5 ფაზა —
// პროდუქტების სტატისტიკა: ტოპ-გაყიდვადი (`GET /stats/products/top-selling`)
// და დაბალი მარაგის (`GET /stats/products/low-stock`) პროდუქტები. F6 ფაზა —
// ახალი მომხმარებლების რეგისტრაცია (`GET /stats/users/signups`), მომხმარებელთა
// ლოიალობა (`GET /stats/users/loyalty`), გადახდების სტატისტიკა
// (`GET /stats/payments`) და ფილიალების გაყიდვები (`GET /stats/branches/sales`).
export const StatsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const [range, setRange] = useState<DateRangeValue>({ groupBy: "day" });
  // ზედა FilterBar-ის კომპანიის ფილტრი — ვრცელდება ყველა კომპანიაზე
  // დამოკიდებულ widget-ზე (overview, შემოსავალი, სტატუსები, ტოპ/დაბალი მარაგის
  // პროდუქტები, ლოიალობა, გადახდები, ფილიალები). მომხმარებლების რეგისტრაცია
  // კომპანიაზე არაა მიბმული, ამიტომ მხოლოდ პერიოდით იფილტრება.
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  // ფილტრების სწრაფი ცვლილებისას ძველი (ნელა დაბრუნებული) პასუხი ახალს არ
  // უნდა გადააწეროს — თითოეული widget-ისთვის ბოლო მოთხოვნის id-ს ვინახავთ.
  const hasActiveFilters = Boolean(range.from || range.to || companyId || (range.groupBy ?? "day") !== "day");
  const handleResetFilters = () => {
    setRange({ groupBy: "day" });
    setCompanyId(undefined);
  };

  const requestIds = useRef<Record<string, number>>({});
  const beginRequest = (key: string) => {
    const id = (requestIds.current[key] ?? 0) + 1;
    requestIds.current[key] = id;
    return () => requestIds.current[key] === id;
  };

  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);
  const [overviewError, setOverviewError] = useState<boolean>(false);

  const fetchOverview = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchOverview");
    setOverviewLoading(true);
    setOverviewError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetOverview(
        companyId
      );
      if (!isLatest()) return;
      setOverview(res.data);
    } catch {
      if (!isLatest()) return;
      setOverviewError(true);
      toast.error("სტატისტიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, companyId]);

  const [revenue, setRevenue] = useState<RevenueOverTimeDto | null>(null);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(true);
  const [revenueError, setRevenueError] = useState<boolean>(false);

  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await CompaniesAPI(router.locale || "ka", session.accessToken).companiesControllerFindAllAdmin(
        1,
        100
      );
      const data = res.data as unknown as PaginatedResponseDto<Company>;
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("კომპანიების ჩატვირთვა ვერ მოხერხდა");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const fetchRevenue = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchRevenue");
    setRevenueLoading(true);
    setRevenueError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetRevenue(
        range.from,
        range.to,
        range.groupBy,
        companyId
      );
      if (!isLatest()) return;
      setRevenue(res.data);
    } catch {
      if (!isLatest()) return;
      setRevenueError(true);
      toast.error("შემოსავლის გრაფიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setRevenueLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchRevenue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, range.groupBy, companyId]);

  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdownDto | null>(null);
  const [statusBreakdownLoading, setStatusBreakdownLoading] = useState<boolean>(true);
  const [statusBreakdownError, setStatusBreakdownError] = useState<boolean>(false);

  const fetchStatusBreakdown = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchStatusBreakdown");
    setStatusBreakdownLoading(true);
    setStatusBreakdownError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetOrderStatusBreakdown(
        range.from,
        range.to,
        companyId
      );
      if (!isLatest()) return;
      setStatusBreakdown(res.data);
    } catch {
      if (!isLatest()) return;
      setStatusBreakdownError(true);
      toast.error("სტატუსების სტატისტიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setStatusBreakdownLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchStatusBreakdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId]);

  const [transitionTimes, setTransitionTimes] = useState<StatusTransitionAvgDto | null>(null);
  const [transitionTimesLoading, setTransitionTimesLoading] = useState<boolean>(true);
  const [transitionTimesError, setTransitionTimesError] = useState<boolean>(false);

  const fetchTransitionTimes = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchTransitionTimes");
    setTransitionTimesLoading(true);
    setTransitionTimesError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetStatusTransitionTimes(
        range.from,
        range.to,
        companyId
      );
      if (!isLatest()) return;
      setTransitionTimes(res.data);
    } catch {
      if (!isLatest()) return;
      setTransitionTimesError(true);
      toast.error("გადასვლის დროების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setTransitionTimesLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchTransitionTimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId]);

  const [topSelling, setTopSelling] = useState<ProductStatDto[] | null>(null);
  const [topSellingLoading, setTopSellingLoading] = useState<boolean>(true);
  const [topSellingError, setTopSellingError] = useState<boolean>(false);
  const [topSellingSortBy, setTopSellingSortBy] = useState<StatsControllerGetTopSellingProductsSortByEnum>(
    StatsControllerGetTopSellingProductsSortByEnum.Revenue
  );
  const [topSellingOrder, setTopSellingOrder] = useState<StatsControllerGetTopSellingProductsOrderEnum>(
    StatsControllerGetTopSellingProductsOrderEnum.Desc
  );
  const [topSellingLimit, setTopSellingLimit] = useState<number>(10);

  const fetchTopSelling = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchTopSelling");
    setTopSellingLoading(true);
    setTopSellingError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetTopSellingProducts(
        range.from,
        range.to,
        companyId,
        topSellingSortBy,
        topSellingOrder,
        topSellingLimit
      );
      if (!isLatest()) return;
      setTopSelling(res.data);
    } catch {
      if (!isLatest()) return;
      setTopSellingError(true);
      toast.error("ტოპ-გაყიდვადი პროდუქტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setTopSellingLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchTopSelling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId, topSellingSortBy, topSellingOrder, topSellingLimit]);

  const [lowStock, setLowStock] = useState<PaginatedResponseDto<LowStockProduct> | null>(null);
  const [lowStockLoading, setLowStockLoading] = useState<boolean>(true);
  const [lowStockError, setLowStockError] = useState<boolean>(false);
  const [lowStockPage, setLowStockPage] = useState<number>(1);
  const [lowStockSortBy, setLowStockSortBy] = useState<string>("stock");
  const [lowStockOrder, setLowStockOrder] = useState<StatsControllerGetLowStockProductsOrderEnum>(
    StatsControllerGetLowStockProductsOrderEnum.Asc
  );
  const [lowStockThresholdText, setLowStockThresholdText] = useState<string>("");
  const [debouncedLowStockThreshold, setDebouncedLowStockThreshold] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLowStockThreshold(lowStockThresholdText.trim()), 300);
    return () => clearTimeout(timer);
  }, [lowStockThresholdText]);

  useEffect(() => {
    setLowStockPage(1);
  }, [lowStockSortBy, lowStockOrder, debouncedLowStockThreshold, companyId]);

  const fetchLowStock = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchLowStock");
    setLowStockLoading(true);
    setLowStockError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetLowStockProducts(
        lowStockPage,
        LOW_STOCK_PAGE_SIZE,
        lowStockSortBy,
        lowStockOrder,
        debouncedLowStockThreshold === "" ? undefined : Number(debouncedLowStockThreshold),
        companyId
      );
      if (!isLatest()) return;
      setLowStock(res.data as unknown as PaginatedResponseDto<LowStockProduct>);
    } catch {
      if (!isLatest()) return;
      setLowStockError(true);
      toast.error("დაბალი მარაგის პროდუქტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setLowStockLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchLowStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, lowStockPage, lowStockSortBy, lowStockOrder, debouncedLowStockThreshold, companyId]);

  const [userSignups, setUserSignups] = useState<UserSignupsDto | null>(null);
  const [userSignupsLoading, setUserSignupsLoading] = useState<boolean>(true);
  const [userSignupsError, setUserSignupsError] = useState<boolean>(false);

  const fetchUserSignups = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchUserSignups");
    setUserSignupsLoading(true);
    setUserSignupsError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetUserSignups(
        range.from,
        range.to,
        range.groupBy
      );
      if (!isLatest()) return;
      setUserSignups(res.data);
    } catch {
      if (!isLatest()) return;
      setUserSignupsError(true);
      toast.error("ახალი მომხმარებლების სტატისტიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setUserSignupsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserSignups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, range.groupBy]);

  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyaltyDto | null>(null);
  const [customerLoyaltyLoading, setCustomerLoyaltyLoading] = useState<boolean>(true);
  const [customerLoyaltyError, setCustomerLoyaltyError] = useState<boolean>(false);

  const fetchCustomerLoyalty = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchCustomerLoyalty");
    setCustomerLoyaltyLoading(true);
    setCustomerLoyaltyError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetCustomerLoyalty(
        range.from,
        range.to,
        companyId
      );
      if (!isLatest()) return;
      setCustomerLoyalty(res.data);
    } catch {
      if (!isLatest()) return;
      setCustomerLoyaltyError(true);
      toast.error("მომხმარებელთა ლოიალობის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setCustomerLoyaltyLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCustomerLoyalty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId]);

  const [paymentStats, setPaymentStats] = useState<PaymentStatsDto | null>(null);
  const [paymentStatsLoading, setPaymentStatsLoading] = useState<boolean>(true);
  const [paymentStatsError, setPaymentStatsError] = useState<boolean>(false);

  const fetchPaymentStats = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchPaymentStats");
    setPaymentStatsLoading(true);
    setPaymentStatsError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetPaymentStats(
        range.from,
        range.to,
        companyId
      );
      if (!isLatest()) return;
      setPaymentStats(res.data);
    } catch {
      if (!isLatest()) return;
      setPaymentStatsError(true);
      toast.error("გადახდების სტატისტიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setPaymentStatsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchPaymentStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId]);

  const [branchSales, setBranchSales] = useState<BranchSalesDto | null>(null);
  const [branchSalesLoading, setBranchSalesLoading] = useState<boolean>(true);
  const [branchSalesError, setBranchSalesError] = useState<boolean>(false);

  const fetchBranchSales = async () => {
    if (!session?.accessToken) return;
    const isLatest = beginRequest("fetchBranchSales");
    setBranchSalesLoading(true);
    setBranchSalesError(false);
    try {
      const res = await StatsAPI(router.locale || "ka", session.accessToken).statsControllerGetBranchSales(
        range.from,
        range.to,
        companyId
      );
      if (!isLatest()) return;
      setBranchSales(res.data);
    } catch {
      if (!isLatest()) return;
      setBranchSalesError(true);
      toast.error("ფილიალების გაყიდვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      if (isLatest()) setBranchSalesLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchBranchSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, range.from, range.to, companyId]);

  return (
    <DashboardLayout title="სტატისტიკა" subtitle="მაღაზიის ანალიტიკა და ძირითადი მაჩვენებლები">
      <S.FilterBar>
        <S.FilterBarHeader>
          <S.FilterBarTitle>
            <ChartIcon size={16} /> ფილტრები
            {hasActiveFilters && <S.FilterCountBadge>აქტიური</S.FilterCountBadge>}
          </S.FilterBarTitle>
          <S.FilterActions>
            <S.ActionButton type="button" variant="secondary" onClick={handleResetFilters} disabled={!hasActiveFilters}>
              <CloseIcon size={14} /> ფილტრის გასუფთავება
            </S.ActionButton>
          </S.FilterActions>
        </S.FilterBarHeader>
        <DateRangePicker
          value={range}
          onChange={setRange}
          companies={companies}
          companyId={companyId}
          onCompanyChange={setCompanyId}
        />
      </S.FilterBar>

      <StatsWidgetState
        loading={overviewLoading}
        error={overviewError}
        data={overview}
        skeleton={<StatsSkeleton count={5} />}
        errorTitle="სტატისტიკის ჩატვირთვა ვერ მოხერხდა"
        onRetry={fetchOverview}
      >
        {(overview) => (
          <S.StatsGrid>
            <S.StatCard>
              <S.StatIcon>
                <ChartIcon size={18} />
              </S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{formatCurrency(overview.todayRevenue)}</S.StatValue>
                <S.StatLabel>დღევანდელი შემოსავალი</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>

            <S.StatCard>
              <S.StatIcon>
                <ChartIcon size={18} />
              </S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{formatCurrency(overview.monthRevenue)}</S.StatValue>
                <S.StatLabel>თვის შემოსავალი</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>

            <S.StatCard>
              <S.StatIcon>
                <CartIcon size={18} />
              </S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{overview.activeOrdersCount}</S.StatValue>
                <S.StatLabel>აქტიური შეკვეთები</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>

            <S.StatCard>
              <S.StatIcon>
                <UserIcon size={18} />
              </S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{overview.newUsersToday}</S.StatValue>
                <S.StatLabel>ახალი მომხმარებლები (დღეს)</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>

            <Link href="/dashboard/products" style={{ textDecoration: "none" }}>
              <S.StatCard>
                <S.StatIcon>
                  <WarningIcon size={18} />
                </S.StatIcon>
                <S.StatInfo>
                  <S.StatValue>{overview.lowStockCount}</S.StatValue>
                  <S.StatLabel>დაბალი მარაგის პროდუქტები</S.StatLabel>
                </S.StatInfo>
              </S.StatCard>
            </Link>
          </S.StatsGrid>
        )}
      </StatsWidgetState>

      <S.ChartsGrid>
        <StatsWidgetState
          loading={revenueLoading}
          error={revenueError}
          data={revenue}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="140px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="240px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="შემოსავლის გრაფიკის ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchRevenue}
        >
          {(revenue) => (
            <RevenueChart data={revenue} groupBy={range.groupBy ?? "day"} />
          )}
        </StatsWidgetState>

        <StatsWidgetState
          loading={statusBreakdownLoading}
          error={statusBreakdownError}
          data={statusBreakdown}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="180px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="260px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="სტატუსების სტატისტიკის ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchStatusBreakdown}
        >
          {(statusBreakdown) => <OrderStatusChart data={statusBreakdown} />}
        </StatsWidgetState>

        <StatsWidgetState
          loading={transitionTimesLoading}
          error={transitionTimesError}
          data={transitionTimes}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="220px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="140px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="გადასვლის დროების ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchTransitionTimes}
        >
          {(transitionTimes) => <TransitionTimesTable data={transitionTimes} />}
        </StatsWidgetState>

        <StatsWidgetState
          loading={topSellingLoading}
          error={topSellingError}
          data={topSelling}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="200px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="260px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="ტოპ-გაყიდვადი პროდუქტების ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchTopSelling}
        >
          {(topSelling) => (
            <TopSellingProductsChart
              data={topSelling}
              sortBy={topSellingSortBy}
              order={topSellingOrder}
              limit={topSellingLimit}
              onSortByChange={setTopSellingSortBy}
              onOrderChange={setTopSellingOrder}
              onLimitChange={setTopSellingLimit}
            />
          )}
        </StatsWidgetState>

        <StatsWidgetState
          loading={lowStockLoading}
          error={lowStockError}
          data={lowStock}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="200px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="260px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="დაბალი მარაგის პროდუქტების ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchLowStock}
        >
          {(lowStock) => (
            <LowStockProductsTable
              products={lowStock.data}
              totalPages={lowStock.meta.totalPages}
              page={lowStockPage}
              onPageChange={setLowStockPage}
              sortBy={lowStockSortBy}
              onSortByChange={setLowStockSortBy}
              order={lowStockOrder}
              onOrderChange={setLowStockOrder}
              threshold={lowStockThresholdText}
              onThresholdChange={setLowStockThresholdText}
              locale={router.locale}
            />
          )}
        </StatsWidgetState>

        <StatsWidgetState
          loading={userSignupsLoading}
          error={userSignupsError}
          data={userSignups}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="180px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="240px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="ახალი მომხმარებლების სტატისტიკის ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchUserSignups}
        >
          {(userSignups) => <UserSignupsChart data={userSignups} groupBy={range.groupBy ?? "day"} />}
        </StatsWidgetState>

        <StatsWidgetState
          loading={customerLoyaltyLoading}
          error={customerLoyaltyError}
          data={customerLoyalty}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="200px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="90px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="მომხმარებელთა ლოიალობის ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchCustomerLoyalty}
        >
          {(customerLoyalty) => <CustomerLoyaltyCard data={customerLoyalty} />}
        </StatsWidgetState>

        <StatsWidgetState
          loading={paymentStatsLoading}
          error={paymentStatsError}
          data={paymentStats}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="200px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="260px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="გადახდების სტატისტიკის ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchPaymentStats}
        >
          {(paymentStats) => <PaymentStatsChart data={paymentStats} />}
        </StatsWidgetState>

        <StatsWidgetState
          loading={branchSalesLoading}
          error={branchSalesError}
          data={branchSales}
          skeleton={
            <S.ChartCard>
              <S.SkeletonPulse width="200px" height="20px" />
              <div style={{ marginTop: 14 }}>
                <S.SkeletonPulse width="100%" height="140px" radius="8px" />
              </div>
            </S.ChartCard>
          }
          errorTitle="ფილიალების გაყიდვების ჩატვირთვა ვერ მოხერხდა"
          onRetry={fetchBranchSales}
        >
          {(branchSales) => <BranchSalesTable data={branchSales} />}
        </StatsWidgetState>
      </S.ChartsGrid>
    </DashboardLayout>
  );
};

export default StatsPage;
