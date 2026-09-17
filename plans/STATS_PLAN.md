
# ფრონტის მხარის გეგმა (Admin Stats Dashboard)

> **სტატუსი: Phase F1-F7 დასრულებულია** (F7-ის ბრაუზერში admin-ით რეალურ მონაცემებზე ხელით
> ტესტირება ჯერ არ შესრულებულა — იხ. F7-ის დათქმა).
> ეს გეგმა წერს, რა უნდა გაკეთდეს ადმინ-პანელის ფრონტში ზემოთ აღწერილი 10 endpoint-ის მოსახმარებლად.
> ამ დროისთვის ცნობილი "consuming frontend" repo არ არსებობს (იხ. CLAUDE.md), ამიტომ ქვემოთ მოცემული
> ნაბიჯები ტექნოლოგია-აგნოსტიკურია (React/Next.js ვარაუდით, ვინაიდან `auth`-ის აღწერაში NextAuth
> figure-ობს) — კონკრეტული framework/UI-lib არჩევანი დაზუსტდეს ფრონტის repo-ს შექმნის/მიბმის დროს.

## წინაპირობები / ღია კითხვები

- რომელ repo-ში/framework-ზე შენდება ადმინ პანელი (ცალკე admin app თუ არსებული shop frontend-ის
  `/admin` route-ები)? — გეგმა ვარაუდობს Next.js + NextAuth-ს (`AuthService`-ის აღწერიდან გამომდინარე),
  მაგრამ ეს დასადასტურებელია.
- chart library არჩევანი (Recharts / Chart.js / visx და ა.შ.) — ჯერ არჩეული არაა.
- როგორ მოხდება admin-only route protection ფრონტზე (middleware/HOC `role === ADMIN`-ზე).

## Phase F1 — API კლიენტი და infrastructure ✅

> **სტატუსი: დასრულებულია.** ეს ფაზა შესრულდა არსებული კოდბაზის კონვენციებზე მორგებით (იხ.
> ქვემოთ შენიშვნები), არა ზემოთ დაწერილი ტექნოლოგია-აგნოსტიკური ვარაუდებით — რეალურად ეს
> `online-shop-next` არის (Next.js Pages Router + NextAuth + `API_Client/`-ის generated OpenAPI
> კლიენტი + `/dashboard/*` ადმინ-პანელი), ასე რომ "ცალკე admin app"/"lib/api/stats.ts" ვარიანტები
> აღარ იყო აქტუალური.

- ✅ Stats API კლიენტის მოდული — ცალკე `lib/api/stats.ts` კი არა, არსებული კონვენციის მიხედვით
      `API_Client/index.ts`-ში დაემატა `StatsAPI(acceptLanguage, accessToken)` factory (იგივე
      პატერნი, რაც `OrdersAPI`/`ProductsAPI` და ა.შ.), რომელიც `StatsApi`-ს (`API_Client/client/apis/stats-api.ts`,
      უკვე გენერირებული `yarn generate:api`-დან) აბრუნებს არსებული auth/timeout/error-interceptor
      ინფრასტრუქტურით (Bearer header უკვე NextAuth session-იდან modelirdeba call-site-ზე, სხვა
      `*API()` ფუნქციების იდენტურად).
- ✅ TypeScript ტიპები — ცალკე ხელით წერა არ დასჭირდა: ბექენდის stats controller-ს OpenAPI-ში
      ზუსტი `@ApiResponse({ type })` აქვს მითითებული ყველა 10 endpoint-ისთვის, ამიტომ
      `DashboardOverviewDto`, `RevenueOverTimeDto`, `ProductStatDto`, `PaginatedResponseDto` და
      დანარჩენი DTO-ები უკვე სწორად გენერირდება `API_Client/client/models/`-ში (განსხვავებით
      `Category`/`User`/`Cart`-ისგან, რომლებსაც `API_Client/types.ts`-ში ხელით override სჭირდებოდათ).
- ✅ Query/data-fetching ფენა — **გადაწყვეტილება: React Query/SWR არ დაემატა**, მიუხედავად
      იმისა, რომ `swr` უკვე არის `package.json`-ში (სხვა, stats-თან დაუკავშირებელი მიზნით
      დამატებული — არცერთი dashboard გვერდი მას ამჟამად არ იყენებს). ყველა არსებული
      `/dashboard/*` გვერდი (`OrdersPage`, `ProductsPage` და ა.შ.) მარტივ
      `useState`/`useEffect` + პირდაპირ `*API()` call-ზეა აგებული, caching/refetch აბსტრაქციის
      გარეშე — Phase F2-F6-ის widget-ებმა იგივე პატერნი უნდა გაიმეორონ კონსისტენციისთვის, ახალი
      dependency-ის შემოღების მაგივრად.
- ✅ Admin route protection — არსებული ორ-ფენიანი გარდი გამოიყენება ახალი middleware-ის გარეშე
      (`middleware.ts` განზრახ არ არსებობს ამ repo-ში, იხ. i18n შენიშვნა CLAUDE.md-ში):
      სერვერზე `getAdminServerSideProps` (`utils/getAdminServerSideProps.ts`) ყველა `/dashboard/*`
      route-ს არააუთენტიფიცირებულ/non-admin ვიზიტორს SSR დონეზე ამისამართებს `/`-ზე, ხოლო
      კლიენტზე `useAdminGuard` + `DashboardLayout` loading/access-denied states-ს უჩვენებს.
      `/dashboard/stats` route-ს ორივე უკვე დაერთო.
- ✅ Date-range picker — `components/pages/dashboard/DateRangePicker.tsx`: `from`/`to`
      (`<input type="date">`, არსებული `S.Input`/`S.FilterGroup`/`S.FilterLabel` styled
      კომპონენტებით) + optional `groupBy: day|week|month` (`S.Select`), `showGroupBy` prop-ით
      გამორთვადი იმ endpoint-ებისთვის სადაც `groupBy` არ არსებობს (branch sales, low-stock).
      გამოყენებულია სატესტოდ `/dashboard/stats`-ის placeholder გვერდზე, საბოლოოდ Phase F3-F6-ის
      ყველა widget-ში იქნება გამოყენებული.

დამატებით (F1-ის infrastructure-ის დასადასტურებლად, პლანში ცალკე ჩამონათვალში არ იყო):
- ✅ `/dashboard/stats` route + `StatsPage` placeholder კომპონენტი (`DashboardLayout`-ში
      ჩართული, sidebar-ში ახალი "სტატისტიკა" ტაბით, `ChartIcon`-ით) — ადასტურებს, რომ route
      protection და `DateRangePicker` მუშაობს; ფაქტობრივი overview cards/charts Phase F2-შია.

## Phase F2 — Dashboard Overview გვერდი (`GET /stats/overview`) ✅

> **სტატუსი: დასრულებულია.** `/dashboard/stats` (`StatsPage.tsx`)-ს დაემატა overview stat cards
> სექცია, არსებულ `S.StatsGrid`/`S.StatCard`/`S.StatIcon`/`S.StatValue`/`S.StatLabel` styled
> კომპონენტებზე დაშენებული (იგივე პატერნი, რაც სხვა dashboard გვერდებზეა).

- ✅ `/dashboard/stats` გვერდი — stat cards: დღევანდელი შემოსავალი, თვის შემოსავალი, აქტიური
      შეკვეთები, დღევანდელი ახალი მომხმარებლები, low-stock პროდუქტების რაოდენობა
      (`StatsAPI().statsControllerGetOverview()`, F1-ში დამატებული factory).
- ✅ Loading skeleton (არსებული `StatsSkeleton` `Skeletons.tsx`-დან, `count=5`) + error state
      (`S.EmptyState` + "ხელახლა ცდა" ღილაკი, `toast.error`-თან ერთად, არსებული `OrdersPage`-ის
      pattern-ის მიხედვით).
- ✅ Low-stock card-ზე ბმული — ვინაიდან Phase F5-ის ცალკე low-stock გვერდი ჯერ არ არსებობს,
      დროებით `/dashboard/products`-ზეა გადამისამართებული (არსებული პროდუქტების გვერდი, სადაც
      `stock`-ით სორტირებაც შესაძლებელია); Phase F5-ში საბოლოო dedicated low-stock გვერდზე
      გადამისამართდება.

## Phase F3 — შემოსავლის გრაფიკი (`GET /stats/revenue`) ✅

> **სტატუსი: დასრულებულია.** `/dashboard/stats`-ს დაემატა `S.ChartsGrid`/`S.ChartCard` სექცია
> ახალი `RevenueChart.tsx` კომპონენტით.

- ✅ Time-series chart — `chart.js`/`react-chartjs-2` (უკვე `package.json`-ში იყო, სხვაგან ჯერ
      გამოუყენებელი; ეს ფაზა პირველი მომხმარებელია), `Line` chart bucketed revenue-სთვის.
      `groupBy` toggle (დღე/კვირა/თვე) F1-ის `DateRangePicker`-იდან უკვე მუშაობს — StatsPage-ის
      `range` state ახლა `statsControllerGetRevenue(from, to, groupBy)`-ს პარამეტრებად გადაეცემა.
- ✅ `previousPeriodRevenue`/`changePercent` ინდიკატორი — ახალი `S.TrendBadge` styled კომპონენტი
      (მწვანე/წითელი/ნეიტრალური ▲/▼/— + %, `null`-safe როცა წინა პერიოდის შემოსავალი 0 იყო).
- ✅ Date-range picker (F1-დან) ინტეგრაცია — `range` state-ის ცვლილებაზე (`from`/`to`/`groupBy`)
      ავტომატურად refetch-ავს `revenue` endpoint-ს ცალკე `useEffect`-ით, `overview`-სგან
      დამოუკიდებლად (overview არ იღებს date-range პარამეტრებს).
- ✅ Loading skeleton (`S.SkeletonPulse`) + error state (`S.EmptyState` + "ხელახლა ცდა"),
      overview-ის იდენტური pattern-ით.

## Phase F4 — შეკვეთების სტატუსების ანალიტიკა ✅

> **სტატუსი: დასრულებულია.** ბექენდის `swagger.json`-ში `/stats/orders/transition-times`
> (`StatusTransitionAvgDto`) უკვე არსებობდა, მაგრამ `API_Client/client`-ში ჯერ არ იყო
> გენერირებული (ძველი `yarn generate:api` გაშვების შემდეგ დამატებული endpoint) — ამ ფაზის
> პირველი ნაბიჯი იყო `yarn generate:api`-ის ხელახლა გაშვება, რამაც `statsControllerGetStatusTransitionTimes`
> და `StatusTransitionAvgDto`/`StatusTransitionAvgItemDto` მოდელები დაამატა.

- ✅ Order status breakdown (`GET /stats/orders/status-breakdown`) — ახალი
      `OrderStatusChart.tsx`: ჰორიზონტალური bar chart (`chart.js`/`react-chartjs-2`, `indexAxis: "y"`),
      pie/donut-ის მაგივრად არჩეული 7 კატეგორიის ზუსტი შედარებადობისთვის. ყველა `OrderStatus`
      ფიქსირებული თანმიმდევრობით ჩანს (`STATUS_ORDER`), მათ შორის ნულოვანი count-ითაც (`breakdown`
      მასივში დაკლებული სტატუსები `0`-ით ივსება). ფერები — `OrderStatusBadge`-ის იგივე სემანტიკური
      ჯგუფები (warning/success/primary/danger), მაგრამ ბარისთვის საკმარისი კონტრასტის ჰექს
      ვარიანტებით (dataviz skill-ის `validate_palette.js`-ით დამოწმებული — `#b45309` (pending) ნაცვლად
      `--ref-warning`-ის ნედლი `#f5b700`-ისა, რომელიც light-surface-ზე კონტრასტს ვერ აკმაყოფილებდა).
      თითო ბარს პირდაპირი label/tooltip აქვს ღირებულებით, ასე რომ პროცესინგი/გაგზავნილია-ს
      (ორივე primary-ლურჯი) სტატუსების იდენტობა ფერზე მარტო არ ეყრდნობა.
- ✅ Status transition times (`GET /stats/orders/transition-times`) — ახალი
      `TransitionTimesTable.tsx`: ცხრილი (`fromStatus → toStatus` — `OrderStatusBadge`-ებით,
      `avgHumanReadable`, `transitionCount` სვეტები). ბექენდის caveat (`from`/`to` ეხება გადასვლის
      *დასრულების* დროს) აღწერილია hover/focus tooltip-ად (`QuestionMarkIcon` + `S.HintTooltip`),
      ცხრილის თავზე.
- ✅ StatsPage ინტეგრაცია — ორივე widget `S.ChartsGrid`-ში დაემატა (`RevenueChart`-ის გვერდით),
      `range.from`/`range.to`-ზე დამოკიდებული ცალკე `useEffect`/`fetch*` წყვილით (F2/F3-ის
      იდენტური loading skeleton + `S.EmptyState`/"ხელახლა ცდა" pattern-ით). `groupBy` ამ ორ
      endpoint-ს არ სჭირდება, ამიტომ `DateRangePicker`-ის `from`/`to`-ზეღა რეაგირებენ.
- ✅ ახალი styled კომპონენტები `style.ts`-ში: `Table`/`Thead`/`Tr`/`Th`/`Td`/`TableScroll`
      (პირველი table-based ცხრილი dashboard-ში — აქამდე ყველა სია card/grid-ზე იყო აგებული),
      `HintTooltip`/`HintTooltipBubble`/`ChartHintRow` (გადასაყენებელი hover/focus tooltip
      pattern-ი, სხვა widget-ებსაც გამოადგება caveat-ebისთვის), `TransitionArrow`.

## Phase F5 — პროდუქტების სტატისტიკა ✅

> **სტატუსი: დასრულებულია.** `/dashboard/stats`-ს `S.ChartsGrid`-ში დაემატა ორი ახალი widget —
> `TopSellingProductsChart.tsx` და `LowStockProductsTable.tsx`, F1-F4-ის იდენტური loading
> skeleton/error/retry pattern-ით.

- ✅ Top-selling products (`GET /stats/products/top-selling`) — ახალი `TopSellingProductsChart.tsx`:
      ჰორიზონტალური bar chart (`chart.js`, `OrderStatusChart`-ის იდენტური `indexAxis: "y"` პატერნი).
      Sort toggle `revenue`/`quantity` — `S.PeriodSelector`/`S.PeriodButton`-ით (F3-ის trend-badge-ის
      გვერდით უკვე არსებული, აქამდე გამოუყენებელი styled კომპონენტები), `limit` selector (5/10/20/50)
      `S.Select`-ით. `order` პარამეტრი ფიქსირებულია `DESC`-ზე (ყოველთვის ტოპ-N, არა ბოლო-N) — ცალკე
      კონტროლი მისთვის გეგმაში არ იყო მოთხოვნილი. Bar-ის სიმაღლე დინამიურია (`data.length * 30px`),
      გრძელი პროდუქტის სახელები y-ღერძზე truncate-დება, სრული სახელი tooltip-ის title-შია.
      `range.from`/`range.to`-ზეც დამოკიდებული (იგივე პერიოდი, რაც revenue/status-breakdown-ს აქვს).
- ✅ Low-stock products (`GET /stats/products/low-stock`) — ახალი `LowStockProductsTable.tsx`:
      `S.Table`-ზე აგებული (F4-ის `TransitionTimesTable`-ის იდენტური სტრუქტურა), სვეტები
      დასახელება/მარაგი/ფასი/კატეგორია. Sort (`stock`/`price`/`createdAt` — ბექენდის
      `LOW_STOCK_ALLOWED_SORT_COLUMNS` allow-list-ის იდენტური) და `order` (ASC/DESC) `S.Select`-ებით,
      threshold ინფუთი (`stock ≤`, 300ms debounce, ცვლილებაზე page 1-ზე რესეტდება). `PaginatedResponseDto`
      — API_Client-ის generated model-ს (`data: Array<object>`) კი არა, `API_Client/types.ts`-ის
      ხელით დაწერილ generic `PaginatedResponseDto<Product>`-ს ვიყენებთ (`ProductsPage`-ის იდენტური
      `as unknown as` cast-ით), რადგან ბექენდის low-stock endpoint-ს OpenAPI-ში item-ის ცხადი ტიპი
      არ აქვს (`Promise<PaginatedResponseDto<Product>>` სერვისში, მაგრამ generated DTO ბუნდოვანია).
      დასახელებაზე ბმული ცალკე admin-edit route-ის ნაცვლად storefront-ის `/products/:id`-ზეა
      (`target="_blank"`) — `ProductsPage`-ის card-ის სურათის ბმულის იდენტური პატერნი, ცალკე
      "ედიტის გახსნა low-stock ცხრილიდან" ფუნქციონალი გეგმაში ცხადად არ იყო მოთხოვნილი. Date-range-ს
      არ იყენებს (მარაგი დროში არ იზომება, მხოლოდ მიმდინარე მდგომარეობა).
- ✅ StatsPage ინტეგრაცია — ორივე widget `S.ChartsGrid`-ში დაემატა (F1-F4 widget-ების გვერდით),
      ცალკე `useState`/`useEffect`/`fetch*` წყვილებით. Top-selling-ს `range`/`sortBy`/`limit`
      dependency-ები აქვს, low-stock-ს — `page`/`sortBy`/`order`/`debouncedThreshold`. "მალე
      დაემატება" placeholder განახლდა, მხოლოდ F6-ის დარჩენილ სამ widget-ზე მიუთითებს.
- ✅ TypeScript compilation: ახალი შეცდომები არ დამატებულა (წინასწარი, დაუკავშირებელი
      `CompleteProfileModal`-ის toast-ტიპის შეცდომა უცვლელია). ESLint: ორივე ახალი ფაილი და
      `StatsPage.tsx` სუფთაა.

## Phase F6 — მომხმარებლები, გადახდები, ფილიალები ✅

> **სტატუსი: დასრულებულია.** `/dashboard/stats`-ს `S.ChartsGrid`-ში დაემატა ბოლო ოთხი widget —
> F1-F5-ის იდენტური loading skeleton/error/retry pattern-ით. "მალე დაემატება" placeholder
> მოიხსნა — ყველა F1-F7-დან დაგეგმილი widget ახლა გვერდზეა (F7 დარჩა layout/testing-ისთვის).

- ✅ User signups chart (`GET /stats/users/signups`) — ახალი `UserSignupsChart.tsx`: bar chart
      (`chart.js`), `UserSignupsDto.buckets`-ზე აგებული, F3-ის `RevenueChart`-ის იდენტური
      `formatBucketLabel`/`groupBy` ლოგიკით (იგივე `range.groupBy`, რაც revenue-ს იყენებს —
      ცალკე picker არ დამატებულა). `totalSignups` სათაურის გვერდით ჩანს.
- ✅ Customer loyalty card (`GET /stats/users/loyalty`) — ახალი `CustomerLoyaltyCard.tsx`:
      `repeatCustomers`/`oneTimeCustomers` თანაფარდობის ჰორიზონტალური stacked bar (ახალი
      `S.LoyaltyBarTrack`/`S.LoyaltyBarFill`/`S.LoyaltyLegend`/`S.LoyaltyDot` styled
      კომპონენტები) + `repeatRatePercent` — `null`-safe (`—` ჩანს, როცა პერიოდში მყიდველი
      არავინაა; ამ დროს ბარიც ცარიელია, `total === 0` შემოწმებით).
- ✅ Payment stats (`GET /stats/payments`) — ახალი `PaymentStatsChart.tsx`: `OrderStatusChart`-ის
      იდენტური ჰორიზონტალური bar chart პატერნი (`STATUS_ORDER` ფიქსირებული თანმიმდევრობით,
      ნულოვანი count-ებითაც), `successRatePercent` — `null`-safe. ახალი
      `components/shared/PaymentStatusBadge` კომპონენტი დაემატა `OrderStatusBadge`-ის იდენტური
      პატერნით (`common` namespace, `payment-status-*` locale keys დაემატა `ka`/`en`/`ru`
      `common.json`-ებში — აქამდე გადახდის სტატუსების თარგმანი საერთოდ არ არსებობდა).
- ✅ Branch sales (`GET /stats/branches/sales`) — ახალი `BranchSalesTable.tsx`: მარტივი ცხრილი
      (`S.Table`, F4/F5-ის იდენტური სტრუქტურა) ფილიალი/შეკვეთები/შემოსავალი სვეტებით; ბექენდი
      ყველა ფილიალს აბრუნებს, ნულოვანი გაყიდვების ჩათვლითაც, ამიტომ ცალკე ფილტრი/სორტირება არ
      დასჭირდა.
- ✅ StatsPage ინტეგრაცია — ოთხივე widget `S.ChartsGrid`-ში დაემატა (F1-F5 widget-ების გვერდით),
      ცალკე `useState`/`useEffect`/`fetch*` წყვილებით. `userSignups`-ს `range.groupBy`-ზეც აქვს
      დამოკიდებულება (revenue-ს იდენტურად), დანარჩენ სამს — მხოლოდ `range.from`/`range.to`-ზე.
- ✅ TypeScript/ESLint: ახალი შეცდომები არ დამატებულა (`npx tsc --noEmit` მხოლოდ წინასწარ
      არსებულ, დაუკავშირებელ `CompleteProfileModal`-ის toast-ტიპის შეცდომას აჩვენებს). ახალი
      ფაილები და `StatsPage.tsx` ESLint-ს სუფთად გადის.

## Phase F7 — გაერთიანება, გაპრიალება, ტესტირება ✅

> **სტატუსი: დასრულებულია** (E2E ნაწილის დათქმით ქვემოთ). F2-F6-ის დროს ეტაპობრივად უკვე
> გამოყენებული კონსისტენტური პატერნების გამო, ამ ფაზის ორი პუნქტი ("grid/responsive layout" და
> "გლობალური date-range") რეალურად უკვე დასრულებული აღმოჩნდა — მხოლოდ დადასტურება დასჭირდა.
> რეალურად ახალი სამუშაო იყო: (1) loading/error/empty ბლოკების სტრუქტურული (არა მხოლოდ
> ვიზუალური) გაერთგვაროვნება და (2) chart-ების accessibility.

- ✅ ყველა card/chart ერთიან dashboard layout-ში — უკვე იყო: `S.StatsGrid` (overview cards)
      და `S.ChartsGrid` (ყველა chart/table widget) `style.ts`-ში უკვე responsive იყო
      (`@media (max-width: 900px/640px/480px)` ბრეიკპოინტები `StatsGrid`/`ChartsGrid`/`ChartCard`-ზე
      F2-F4-დან). ცვლილება არ დასჭირდა.
- ✅ გლობალური date-range state — უკვე იყო: ერთი `range` (`DateRangeValue`) state
      `StatsPage`-ში F1-დან, ყველა widget რომელსაც თარიღები სჭირდება (`revenue`,
      `statusBreakdown`, `transitionTimes`, `topSelling`, `userSignups`, `customerLoyalty`,
      `paymentStats`, `branchSales`) მასზეა დამოკიდებული ერთი `DateRangePicker`-ის მეშვეობით.
      ცალკე picker-ები არასდროს დამატებულა. ცვლილება არ დასჭირდა.
- ✅ Empty/error/loading states-ის ერთგვაროვნება — ახალი `StatsWidgetState.tsx` generic
      wrapper კომპონენტი: აქამდე 10-ივე widget-ს `StatsPage.tsx`-ში იდენტური, ხელით
      გამეორებული ternary ბლოკი ჰქონდა (`loading ? skeleton : error/!data ? EmptyState : content`,
      ~250 ხაზი დუბლირებული JSX). ახლა ეს ლოგიკა ერთხელ არის დაწერილი, ყველა widget მას
      იძახებს `<StatsWidgetState loading={...} error={...} data={...} skeleton={...}
      errorTitle="..." onRetry={...}>{(data) => <Widget data={data} />}</StatsWidgetState>`
      ფორმით — სტრუქტურულად გარანტირებული კონსისტენცია, არა მხოლოდ copy-paste-ით მიღწეული.
      `StatsPage.tsx` დაახლოებით 250 ხაზით შემცირდა ცვლილების გარეშე ვიზუალურ ქცევაში.
- ✅ Accessibility — ბექენდის Chart.js `<canvas>` ელემენტებს (`RevenueChart`, `OrderStatusChart`,
      `PaymentStatsChart`, `TopSellingProductsChart`, `UserSignupsChart`) screen reader-ისთვის
      ტექსტური ალტერნატივა არ ჰქონდა (canvas თავისთავად "invisible" არის accessibility tree-ში).
      დაემატა `role="img"` + `aria-label` თითოეული `S.ChartCanvasWrapper`-ისთვის, ქართული
      აღწერით (მაგ. "შემოსავლის დროში ცვლილების გრაფიკი"). `CustomerLoyaltyCard` და
      `BranchSalesTable`/`TransitionTimesTable`/`LowStockProductsTable` ცვლილება არ დასჭირდა —
      მათი მონაცემები უკვე ტექსტად/ცხრილის სახით ჩანს, canvas-ზე დამოკიდებული არაა.
- ⚠️ i18n — გადამოწმდა, რომ `/dashboard/*` (მათ შორის ახალი stats widget-ები) მთლიანად
      ქართულენოვანია, `next-translate`-ს მხოლოდ გაზიარებული `OrderStatusBadge`/
      `PaymentStatusBadge`-ის სტატუსების ლეიბლებისთვის იყენებს (F4/F6-ში უკვე `ka`/`en`/`ru`
      `common.json`-ებში დამატებული) — ეს არსებული კონვენციაა ყველა სხვა `/dashboard/*`
      გვერდზეც (`OrdersPage`, `ProductsPage` და ა.შ. ასევე hardcoded ქართულია), ამიტომ დამატებითი
      თარგმანი საჭირო არ იყო.
- ⚠️ **E2E/manual ტესტი — ნაწილობრივ დადასტურებული, სრულად ვერ შესრულდა ამ სესიაში.**
      გადამოწმდა: `npx tsc --noEmit` (მხოლოდ წინასწარი, დაუკავშირებელი
      `CompleteProfileModal` toast-ტიპის შეცდომაა), `next lint` (სუფთა), `jest` (24/24 გადის),
      და `yarn dev:next`-ით რეალურად აწეული dev server-ზე `curl`-ით დადასტურდა, რომ
      `/ka/dashboard/stats` არაავტორიზებული მოთხოვნისთვის სწორად `307`-ით `/`-ზე
      გადამისამართდება (`getAdminServerSideProps`) და გვერდი კომპილირდება 500-ის გარეშე.
      **admin-ით რეალურ ბექენდის მონაცემებზე ბრაუზერში ვიზუალური ჩატვირთვა (chart-ების
      რენდერი, tooltip-ები, sort/pagination ინტერაქციები) ამ სესიაში არ გადამოწმებულა** —
      საჭიროებს admin ანგარიშით ხელით (browser-ში) შემოწმებას რეალურ `../online-shop-nest`
      ბექენდთან.

### F7-ის შემდეგ ჩატარებული სრული აუდიტი (ბექენდის კონტროლერის საწინააღმდეგოდ)

> ცალკე subagent-მა გადაამოწმა ყველა 10 endpoint-ის რეალური backend კონტროლერის
> (`online-shop-nest/src/stats/stats.controller.ts`/`stats.service.ts`/`dto/*`) სიგნატურა —
> query param-ები, enum-ები, default მნიშვნელობები — უშუალოდ ფრონტის კოდთან და გენერირებულ
> `API_Client/client/apis/stats-api.ts`-თან, `swagger.json`-ის ან უკვე გენერირებული client-ის
> ნდობის გარეშე.

- ✅ 9/10 endpoint სრულად ემთხვევა გეგმის აღწერას (overview, revenue, status-breakdown,
      low-stock, user-signups, customer-loyalty, payments, branch-sales, transition-times) —
      ყველა query param, enum და response ველი გამოყენებულია სწორად, `API_Client/client/apis/stats-api.ts`
      1:1 შეესაბამება ბექენდის კონტროლერს (staleness არ აღმოჩნდა).
- ✅ **გამოსწორდა**: `GET /stats/products/top-selling`-ის `order` (ASC/DESC) query param
      ბექენდზე არსებობდა, მაგრამ ფრონტიდან არასდროს იგზავნებოდა
      (`StatsPage.tsx`-ში ჰარდკოდილი `undefined`, ყოველთვის default DESC-ზე ეყრდნობოდა) —
      "ყველაზე სუსტად გაყიდვადი" ხედვა მიუწვდომელი იყო. დაემატა რეალური ASC/DESC toggle
      (`TopSellingProductsChart.tsx`-ში ახალი `S.Select`: "საუკეთესო"/"ყველაზე სუსტი",
      `LowStockProductsTable`-ის `order`-select-ის იდენტური პატერნით), `StatsPage.tsx`-ში
      `topSellingOrder` state + `fetchTopSelling`-ის dependency-ებში დამატებული.
- ℹ️ მცირე, არა-ბლოკირებადი დაკვირვებები (ცვლილება არ დასჭირდა): `TopSellingProductsChart`-ის
      `limit` არჩევანი (5/10/20/50) ბექენდის max=100-ზე კონსერვატიულია — გეგმა ამას პირდაპირ
      არ მოითხოვდა; `LowStockProductsTable`-ის გვერდის ზომა ფიქსირებულია 10-ზე (ბექენდის
      max=100, კონტროლი არ არის გამოტანილი) — გეგმაშიც ასეა ჩამოყალიბებული; admin roles/guards
      ბექენდსა და ფრონტს შორის სრულად ემთხვევა (მარტივი `ADMIN` როლი ორივე მხარეს).
      `LowStockProductsTable.tsx`-ში `getCategoryName`-ის გამოძახება პროდუქტის სახელისთვის
      სახელის მიხედვით დამაბნეველია, მაგრამ ფუნქციონალურად სწორია (generic
      `resolveField(translations, "name", locale)` helper-ია, არა კატეგორია-სპეციფიკური).

---

**შენიშვნა**: ეს გეგმა შედგენილია ცნობილი ბექენდის endpoint-ების საფუძველზე (STATS_PLAN.md-ის ზემოთ
მოცემული ნაწილი). ფრონტის კონკრეტული repo/framework/design system რომ დაზუსტდეს, ეს ფაზები
საჭიროებისამებრ დაზუსტდეს/გადანაწილდეს — ეს დოკუმენტი "living plan"-ია და არა ფიქსირებული სქემა.
