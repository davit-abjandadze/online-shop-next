import React from "react";
import { CartIcon, ClipboardIcon, MapPinIcon, LockIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export type PurchaseStep = "cart" | "order" | "address" | "payment";

const STEPS: { key: PurchaseStep; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { key: "cart", label: "კალათა", icon: CartIcon },
  { key: "order", label: "მონაცემები", icon: ClipboardIcon },
  { key: "address", label: "მისამართი", icon: MapPinIcon },
  { key: "payment", label: "გადახდა", icon: LockIcon },
];

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
  return (
    <S.Wrapper aria-label="ყიდვის საფეხურები">
      {STEPS.map((step, index) => {
        const state = completed.includes(step.key) ? "done" : step.key === current ? "active" : "upcoming";
        const Icon = step.icon;
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
            {index < STEPS.length - 1 && <S.Connector $filled={state === "done"} />}
          </React.Fragment>
        );
      })}
    </S.Wrapper>
  );
};

export default PurchaseSteps;
