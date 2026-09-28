import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CookieConsent from "./index";
import { CookieConsentProvider, useCookieConsent } from "@/context/CookieConsent";

// თარგმანის key-ები პირდაპირ ბრუნდება — ტესტი key-ებით ეძებს ღილაკებს
jest.mock("next-translate/useTranslation", () => () => ({ t: (key: string) => key }));
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
  return MockLink;
});

const clearCookies = () => {
  document.cookie.split("; ").forEach((part) => {
    const name = part.split("=")[0];
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  });
};

const SettingsOpener = () => {
  const { openSettings } = useCookieConsent();
  return (
    <button type="button" onClick={openSettings}>
      open-settings
    </button>
  );
};

const renderWithProvider = () =>
  render(
    <CookieConsentProvider>
      <SettingsOpener />
      <CookieConsent />
    </CookieConsentProvider>
  );

describe("CookieConsent", () => {
  beforeEach(clearCookies);

  it("პირველ ვიზიტზე ჩნდება", () => {
    renderWithProvider();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("cookie-accept-all")).toBeInTheDocument();
    expect(screen.getByText("cookie-reject")).toBeInTheDocument();
  });

  it("ყველას მიღება ინახავს analytics=true-ს და მალავს მოდალს", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("cookie-accept-all"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":true');
  });

  it("უარყოფა ინახავს analytics=false-ს", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("cookie-reject"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":false');
  });

  it("შენახული არჩევანისას აღარ ჩნდება, პარამეტრებიდან კი ხელახლა იხსნება", () => {
    document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify({ v: 1, analytics: false }))}; Path=/`;
    renderWithProvider();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("open-settings"));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // პარამეტრების ხედი — ანალიტიკის გადამრთველი მიმდინარე (გამორთული) არჩევანით
    const analyticsSwitch = screen.getByLabelText("cookie-analytics-title") as HTMLInputElement;
    expect(analyticsSwitch.checked).toBe(false);

    fireEvent.click(analyticsSwitch);
    fireEvent.click(screen.getByText("cookie-save"));
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":true');
  });

  it("ძველი ვერსიის თანხმობას არ ცნობს", () => {
    document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify({ v: 0, analytics: true }))}; Path=/`;
    renderWithProvider();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
