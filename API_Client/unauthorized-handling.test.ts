/**
 * ტესტი: 401-ის ავტომატური დამუშავება createAxiosInstance-ის response
 * interceptor-ში — ბექენდზე მომხმარებლის წაშლის შემდეგ (JWT session ჯერ
 * კიდევ ვადაშია ლოკალურად) 401-ზე უნდა მოხდეს signOut + login-ზე redirect.
 */

export {};

const signOutMock = jest.fn();

jest.mock("next-auth/react", () => ({
  signOut: (...args: any[]) => signOutMock(...args),
}));

// SSR flag-ს false-ზე ვაყენებთ, რომ client-side ქცევა შევამოწმოთ.
jest.mock("../constants", () => ({
  API_URL: "http://localhost:5000",
  SSR: false,
}));

describe("handleUnauthorizedResponse", () => {
  beforeEach(() => {
    jest.resetModules();
    signOutMock.mockReset();
    signOutMock.mockResolvedValue(undefined);

    // window.location.replace-ის mock — jsdom-ში navigation არ არის
    // დაშვებული.
    delete (window as any).location;
    (window as any).location = { replace: jest.fn() };
  });

  it("signOut-ს იძახებს და login გვერდზე გადამისამართებას აკეთებს authenticated ენდპოინტზე 401-ის დროს", async () => {
    const { handleUnauthorizedResponse } = require("./index");

    handleUnauthorizedResponse({
      config: { url: "/users/profile" },
      response: { status: 401 },
    });

    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });

    // signOut() promise-ის დასრულების მოლოდინი
    await Promise.resolve();
    await Promise.resolve();

    expect(window.location.replace).toHaveBeenCalledWith(
      "/login?sessionExpired=1"
    );
  });

  it("არ იძახებს signOut-ს /auth/login ენდპოინტზე 401-ის დროს (infinite loop-ის თავიდან ასაცილებლად)", () => {
    const { handleUnauthorizedResponse } = require("./index");

    handleUnauthorizedResponse({
      config: { url: "/auth/login" },
      response: { status: 401 },
    });

    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("პარალელურ 401-ებზე signOut-ს მხოლოდ ერთხელ იძახებს", () => {
    const { handleUnauthorizedResponse } = require("./index");

    handleUnauthorizedResponse({
      config: { url: "/users/profile" },
      response: { status: 401 },
    });
    handleUnauthorizedResponse({
      config: { url: "/orders" },
      response: { status: 401 },
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
