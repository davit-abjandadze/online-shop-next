import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 640px) {
    padding: 0 12px;
  }
`;

export const Section = styled("section")`
  padding: 30px 0;

  @media (max-width: 640px) {
    padding: 36px 0;
  }
`;

export const SectionHeader = styled("div")`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`;

export const SectionTitle = styled("h2")`
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ref-text-primary);
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
  white-space: nowrap;

  &:hover {
    color: var(--ref-primary-hover);
  }
`;

/* ---------- Hero Slider ---------- */
/* სრულსიგანიანი (viewport-ის სრულ სიგანეზე გადაჭიმული) სლაიდერი — არა ჩარჩოში ჩასმული
   ბანერი. თითოეული სლაიდი: დიდი "პროდუქტის ფოტოს" ადგილი (რეალური ფოტოს ატვირთვამდე
   ხატულა+გრადიენტი), სათაური, მოკლე ტექსტი, "Shop Now" ღილაკი. ავტომატურად ბრუნავს
   (HeroSlider-ის useEffect-ის ინტერვალით) და აქვს პრევ/ნექსტ ისრები + წერტილოვანი ნავიგაცია. */

export const Hero = styled("section")`
  position: relative;
  overflow: hidden;
  width: 100%;
  /* background: linear-gradient(120deg, #043165 0%, #0060cc 50%,  #0080ff 120%); */
  background: linear-gradient(120deg, #0080ff 0%, #00bfff 50%, #0080ff 100%);
  color: #ffffff;

  .swiper {
    width: 100%;
  }
`;

/* HeroRow აერთიანებს გვერდით ფილტრს და სლაიდერს — ორივეს Hero-ს ერთსა და იმავე
   1320px კონტეინერში აყენებს. ნავიგაცია (ისრები/წერტილები) აღარაა absolute overlay —
   ის სლაიდერის კონტენტის ქვემოთ ჩვეულებრივ ნაკადშია, ამიტომ ვერასდროს გადაეფარება
   კონტენტს/ღილაკს და მუდამ მინიმუმ 30px-ითაა დაშორებული (იხ. HeroControls). */
export const HeroRow = styled("div")`
  position: relative;
  z-index: 2;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  /* stretch (და არა flex-start) — HeroFilterPanel სლაიდერის (HeroSliderArea)
     სიმაღლეს ყოველთვის მთლიანად იმეორებს, თუნდაც კატეგორია ცოტა იყოს და
     პანელის საკუთარი კონტენტი ნაკლებ სივრცეს იკავებდეს. */
  align-items: stretch;
  gap: 24px;
  padding: 30px 24px;

  @media (max-width: 900px) {
    padding: 40px 28px;
  }
`;

/* ---------- ჰედერის ქვემოთ კატეგორიების დროპდაუნ-ზოლი ---------- */
/* ჰერო სლაიდერის გვერდითი ფილტრის ნაცვლად — ჰორიზონტალური ზოლი ჰედერის
   ქვემოთ, სლაიდერამდე. თითოეული კატეგორია ცალკე დროპდაუნია: თუ ქვეკატეგორია
   აქვს, ხელის დაჭერისას იშლება "ყველა" + ქვეკატეგორიების სია; თუ არა,
   პირდაპირ ბმულია კატეგორიის გვერდზე (მაგ. აკუმულატორი). */
export const CategoryFilterBar = styled("div")`
  position: relative;
  z-index: 5;
  background: var(--ref-bg-elevated);
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const CategoryFilterBarInner = styled("div")`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 900px) {
    padding: 0 16px;
  }
`;

export const FilterDropdown = styled("div")`
  position: relative;
  flex-shrink: 0;
`;

export const FilterDropdownTrigger = styled("button")<{ open?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 14px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: ${({ open }) => (open ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  transition: color 0.12s ease;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const FilterBarLink = styled("a")`
  display: flex;
  align-items: center;
  padding: 14px 14px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
  text-decoration: none;
  transition: color 0.12s ease;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const FilterDropdownChevron = styled("span")<{ open?: boolean }>`
  display: inline-flex;
  color: var(--ref-text-secondary);
  transition: transform 0.2s ease;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const FilterDropdownPanel = styled("div")`
  position: absolute;
  top: 110%;
  left: 0;
  min-width: 200px;
  padding: 8px;
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  box-shadow: var(--ref-shadow-lg);
  border: 1px solid var(--ref-border-soft);
  z-index: 20;
`;

export const FilterDropdownItem = styled("a")`
  display: block;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ref-text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--ref-primary-soft);
    color: var(--ref-primary);
  }
`;

export const FilterEmpty = styled("span")`
  display: block;
  padding: 12px 14px;
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

/* სლაიდერის ზონა HeroRow-ის შიგნით — ფილტრის პანელის გვერდით იკავებს დარჩენილ
   სივრცეს. ნავიგაცია (HeroControls) ჩვეულებრივ ნაკადშია სლაიდის შემდეგ, არა
   absolute overlay — ამიტომ ვერასდროს გადაეფარება კონტენტს/ღილაკს და მუდამ
   სლაიდერისგან მინიმუმ 30px-ითაა დაშორებული. */
export const HeroSliderArea = styled("div")`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const HeroSlide = styled("div")`
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 900px) {
    min-height: 0;
    flex-direction: column-reverse;
    text-align: center;
  }
`;

export const HeroContent = styled("div")`
  max-width: 480px;
  position: relative;
  z-index: 1;
`;

export const HeroEyebrow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 16px;

  span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #00dfff;
  }

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

export const HeroEyebrowBar = styled("span")`
  width: 24px;
  height: 2px;
  background: #00dfff;
  display: inline-block !important;
`;

export const HeroTitle = styled("h1")`
  margin: 0 0 16px 0;
  font-weight: 400;
  font-size: 46px;
  line-height: 1.14;

  @media (max-width: 640px) {
    font-size: 30px;
  }
`;

export const HeroText = styled("p")`
  margin: 0 0 28px 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.68);
`;

export const HeroButton = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 28px;
  border-radius: 14px;
  background: var(--ref-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 16px 30px -10px rgba(0, 191, 255, 0.55);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  &:hover {
    background: var(--ref-primary-hover);
    transform: translateY(-2px);
  }
`;

export const HeroArt = styled("div")<{ from: string; to: string; image?: string }>`
  flex-shrink: 0;
  width: 320px;
  height: 320px;
  border-radius: 28px;
  background: ${({ from, to, image }) =>
    image ? `url(${image}) center / cover no-repeat` : `linear-gradient(160deg, ${from}, ${to})`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(11, 20, 38, 0.2);

  @media (max-width: 640px) {
    width: 200px;
    height: 200px;
  }
`;

/* ნავიგაციის მთლიანი მწკრივი (წერტილები + ისრები) — ყოველთვის სლაიდერის კონტენტის
   ქვემოთ, ჩვეულებრივ document flow-ში (არა overlay), მინიმუმ 30px მარჯინით, რომ
   არასდროს გადაეფაროს კონტენტს ან CTA ღილაკს, სლაიდის სიმაღლის შეცვლის მიუხედავად. */
export const HeroControls = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 30px;

  @media (max-width: 900px) {
    justify-content: center;
    flex-direction: column-reverse;
    gap: 20px;
  }
`;

export const HeroArrows = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const HeroArrow = styled("button")`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;

export const HeroDots = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeroDot = styled("button")<{ active?: boolean }>`
  width: ${({ active }) => (active ? "22px" : "6px")};
  height: 6px;
  border-radius: 3px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ active }) => (active ? "#ffffff" : "rgba(255,255,255,0.4)")};
  transition: width 0.2s ease, background 0.2s ease;
`;

/* ---------- Categories ---------- */

export const CategoryHeader = styled("div")`
  text-align: center;
  margin-bottom: 32px;
`;

export const CategoryTitle = styled("h2")`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const CategoryGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const CategoryCard = styled("a")<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 12px;
  border-radius: 20px;
  background: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  box-shadow: ${({ active }) => (active ? "var(--ref-shadow-lg)" : "var(--ref-shadow-sm)")};
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
border: 1px solid rgb(241, 245, 249);
    box-shadow: rgba(15, 23, 42, 0.15) 0px 12px 28px -18px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ref-shadow-md);
    border-color: var(--ref-primary);
    background-color: var(--ref-primary);

    span{
      color: #ffffff;
    }
    &> div{
      background-color: #ffffff2e;
    }
  }
`;

export const CategoryIconBadge = styled("div")<{ active?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:  #eef3fe;
  color: ${({ active }) => (active ? "#ffffff" : "var(--ref-primary)")};
  transition: background 0.15s ease, color 0.15s ease;

`;

export const CategoryName = styled("span")<{ active?: boolean }>`
  font-size: 14px;
  font-weight: 400;
  color: var(--ref-text-primary);
  text-align: center;
`;

export const EmptyRow = styled("p")`
  color: var(--ref-text-secondary);
  font-size: 14px;
`;

/* ---------- Products grid (shared shape with catalog) ---------- */

export const ProductsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

export const SkeletonCard = styled("div")`
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
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/* ---------- Promo banner ---------- */

export const PromoBanner = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 40px 48px;
  border-radius: 24px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);

  @media (max-width: 720px) {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
  }
`;

export const PromoText = styled("div")`
  max-width: 520px;
`;

export const PromoTitle = styled("h3")`
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const PromoSubtitle = styled("p")`
  margin: 0;
  font-size: 15px;
  color: var(--ref-text-secondary);
`;

export const PromoButton = styled("a")`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: 12px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: var(--ref-primary-hover);
    transform: translateY(-2px);
  }
`;

/* ---------- New arrivals (horizontal scroll) ---------- */

export const ScrollRow = styled("div")`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;

  & > * {
    scroll-snap-align: start;
    flex: 0 0 240px;
  }
`;

/* ---------- Benefits ---------- */

export const BenefitsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const BenefitCard = styled("div")`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 16px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
`;

export const BenefitIconBadge = styled("div")`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
`;

export const BenefitTitle = styled("div")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const BenefitText = styled("div")`
  font-size: 12px;
  color: var(--ref-text-secondary);
`;
