import styled from "styled-components";

export const Section = styled("section")`
  padding: 24px 0;

  @media (min-width: 640px) {
    padding: 30px 0;
  }
`;

/* Mobile-first: ვიწრო ეკრანზე სათაური საკუთარ სტრიქონზეა (column), ისრები +
   "ყველას ნახვა" ცალკე მწკრივად, სრულ სიგანეზე გადანაწილებული — რომ გრძელი
   სათაური აღარ ეჯახებოდეს/იჭყლიტებოდეს ნავიგაციასთან ერთ row-ში. */
export const SectionHeader = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }
`;

export const SectionTitle = styled("h2")`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ref-text-primary);

  @media (min-width: 640px) {
    font-size: 24px;
  }
`;

export const SectionHeaderActions = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  flex-shrink: 0;

  @media (min-width: 640px) {
    width: auto;
  }
`;

export const ViewAllLink = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

/* ჰერო სლაიდერის ნავიგაციის ღილაკების იგივე ვიზუალური პატერნი (იხ.
   components/pages/home/style.ts HeroArrow), მაგრამ ღია ფონზე მორგებული —
   ეს ბლოკი ჰერო სექციისგან განსხვავებით მუქი ფონი არ აქვს. */
export const SliderNav = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SliderNavButton = styled("button")`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--ref-primary);
    border-color: var(--ref-primary);
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const ScrollRow = styled("div")`
  .swiper-slide {
    /* მობაილზე ერთი სლაიდი ივსება მთლიან სიგანეზე (peek-ის ნაცვლად) — ერთი
       პროდუქტი ჩანდეს ეკრანზე ერთდროულად, არა ორი-სამი ნაწილობრივ. */
    width: 100%;
    height: auto;

    @media (min-width: 480px) {
      width: 220px;
    }

    @media (min-width: 640px) {
      width: 260px;
    }
  }
`;

/* ჩატვირთვის სქელეტონი swiper-ის გარეშე, უბრალო ჰორიზონტალური სქროლით. */
export const SkeletonRow = styled("div")`
  display: flex;
  gap: 20px;
  overflow-x: hidden;
`;

export const SkeletonCard = styled("div")`
  flex: 0 0 260px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--ref-border-soft);
  background: var(--ref-bg-elevated);
`;

export const SkeletonBlock = styled("div")<{ height?: string }>`
  height: ${({ height }) => height || "18px"};
  background: linear-gradient(90deg, var(--ref-bg) 25%, var(--ref-border-soft) 50%, var(--ref-bg) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;
