import styled, { css } from "styled-components";

export const Wrapper = styled("nav")`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin: 0 0 28px 0;
  padding: 20px 16px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;

  @media (max-width: 560px) {
    padding: 16px 8px;
  }
`;

export const Step = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 96px;

  @media (max-width: 560px) {
    min-width: 72px;
  }
`;

// წრიული აიქონის ბეჯი — done/active/upcoming მდგომარეობებით (chevron-ბმულების
// ნაცვლად, სურათზე ნაჩვენები ჰორიზონტალური სტეპერის ლოგოებიანი ვერსია).
export const Badge = styled("div")<{ $state: "done" | "active" | "upcoming" }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border: 2px solid var(--ref-border-soft);
  background: var(--ref-bg);
  color: var(--ref-text-secondary);

  ${({ $state }) =>
    $state === "active" &&
    css`
      border-color: var(--ref-primary);
      background: var(--ref-primary-soft);
      color: var(--ref-primary);
      box-shadow: 0 0 0 4px var(--ref-primary-soft);
    `}

  ${({ $state }) =>
    $state === "done" &&
    css`
      border-color: var(--ref-primary);
      background: var(--ref-primary);
      color: var(--ref-text-on-primary, #fff);
    `}

  @media (max-width: 560px) {
    width: 36px;
    height: 36px;
  }
`;

export const Label = styled("span")<{ $active?: boolean }>`
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ $active }) => ($active ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};
  text-align: center;
  white-space: nowrap;

  @media (max-width: 560px) {
    font-size: 11px;
  }
`;

// ორ ბეჯს შორის შემაერთებელი ხაზი — pretendard-ულად ცენტრირებულია ბეჯის
// სიმაღლეზე, რომ ლეიბლთან არ გადაიკვეთოს.
export const Connector = styled("div")<{ $filled?: boolean }>`
  flex: 1;
  max-width: 96px;
  height: 2px;
  margin-top: 22px;
  background: ${({ $filled }) => ($filled ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  transition: background 0.2s ease;

  @media (max-width: 560px) {
    margin-top: 18px;
    max-width: 32px;
  }
`;
