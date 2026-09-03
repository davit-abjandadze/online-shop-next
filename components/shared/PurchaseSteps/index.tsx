import React from "react";
import useTranslation from "next-translate/useTranslation";
import { CartIcon, ClipboardIcon, MapPinIcon, LockIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export type PurchaseStep = "cart" | "order" | "address" | "payment";

const STEP_ICONS: Record<PurchaseStep, React.FC<{ size?: number; color?: string }>> = {
  cart: CartIcon,
  order: ClipboardIcon,
  address: MapPinIcon,
  payment: LockIcon,
};

const STEP_ORDER: PurchaseStep[] = ["cart", "order", "address", "payment"];

// ყიდვის პროცესის სტეპერი — cart/checkout გვერდების კონტენტის თავში,
// ლოგოებით (აიქონი + მოკლე ტექსტი) ტექსტოვანი ჩამონათვალის ნაცვლად.
// checkout ერთ გვერდზეა (პერსონალური ინფორმაცია/მიწოდება/გადახდა სექციები ერთად
// ჩანს), ამიტომ `current`/`completed` checkout-ის კომპონენტიდან დინამიურად
// გამოითვლება — რომელი სექციაა სრულად შევსებული (done) და რომელია მომდევნო
// შესავსები (active), ფორმის ვალიდაციის მდგომარეობის მიხედვით.
export const PurchaseSteps: React.FC<{ current: PurchaseStep; completed?: PurchaseStep[] }> = ({
  current,
  completed = [],
}) => {
  const { t } = useTranslation("common");
  const STEPS: { key: PurchaseStep; label: string }[] = [
    { key: "cart", label: t("purchase-step-cart") },
    { key: "order", label: t("purchase-step-order") },
    { key: "address", label: t("purchase-step-address") },
    { key: "payment", label: t("purchase-step-payment") },
  ];

  return (
    <S.Wrapper aria-label={t("purchase-steps-aria")}>
      {STEPS.map((step, index) => {
        const state = completed.includes(step.key) ? "done" : step.key === current ? "active" : "upcoming";
        const Icon = STEP_ICONS[step.key];
        return (
          <React.Fragment key={step.key}>
            <S.Step>
              <S.Badge $state={state}>
                {/* MapPinIcon (მისამართის ნაბიჯი) თეთრი fill-ითაა დახატული, ამიტომ
                    "upcoming" მდგომარეობის თეთრ ბეჯზე უხილავი იქნებოდა — მისთვის
                    ცალკე ფერი გადაეცემა state-ის მიხედვით (#65676b/თეთრი) */}
                <Icon size={20} color={step.key === "address" ? (state === "upcoming" ? "#65676b" : "white") : undefined} />
              </S.Badge>
              <S.Label $active={state !== "upcoming"}>{step.label}</S.Label>
            </S.Step>
            {index < STEP_ORDER.length - 1 && <S.Connector $filled={state === "done"} />}
          </React.Fragment>
        );
      })}
    </S.Wrapper>
  );
};

export default PurchaseSteps;
