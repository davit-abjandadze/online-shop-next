import {
  AddressesApi,
  AttributesApi,
  AuthApi,
  BranchesApi,
  CartApi,
  CategoriesApi,
  ColorsApi,
  CompaniesApi,
  Configuration,
  FavoritesApi,
  HeroSlidesApi,
  OrdersApi,
  OtpApi,
  PaymentsApi,
  ProductsApi,
  UsersApi,
} from "./client";
import axios from "axios";
import { API_URL, SSR } from "../constants";
import * as cache from "memory-cache";
import { getCookie } from "cookies-next";
import http from "http";
import https from "https";
import { signOut } from "next-auth/react";

// axios და OpenAPI კლიენტების კონფიგურაცია

const ApiConfig = new Configuration({
  basePath: API_URL,
});

const config = {
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  maxContentLength: 50 * 1024 * 1024, // 50MB max response size
  maxBodyLength: 50 * 1024 * 1024, // 50MB max request size
  // Only configure agents on server-side
  ...(SSR && {
    httpAgent: new http.Agent({
      keepAlive: true,
      maxSockets: 50,
      timeout: 30000,
    }),
    httpsAgent: new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      timeout: 30000,
    }),
  }),
};

// მოთხოვნის URL-ები, რომლებზეც 401 არ უნდა იწვევდეს ავტომატურ signOut-ს —
// ეს არაავტორიზებული (accessToken-ის გარეშე გამოძახებადი) ენდპოინტებია,
// სადაც 401 ჩვეულებრივი, მოსალოდნელი პასუხია (მაგ. არასწორი პაროლი) და
// მისი signOut-ად ინტერპრეტაცია infinite redirect loop-ს გამოიწვევდა.
// შენიშვნა: /auth/profile, /auth/dashboard, /auth/change-password და ა.შ.
// აქ განზრახ არაა — ისინი accessToken-ით ავტორიზებული ენდპოინტებია და მათზე
// 401 ზუსტად ის სიგნალია, რაც ამ ლოგიკამ უნდა დაიჭიროს.
const AUTH_ENDPOINTS_EXCLUDED_FROM_AUTO_LOGOUT = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/facebook",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// რამდენიმე პარალელურმა 401-მა რომ არ გამოიწვიოს signOut()-ის რამდენჯერმე
// გამოძახება/რამდენიმე toast/redirect.
let isLoggingOutDueToExpiredSession = false;

// გლობალურად (ვინაიდან ეს axios instance-ის დონეზეა და არა React
// component-ის შიგნით) ვამუშავებთ 401-ს: ბექენდზე მომხმარებლის წაშლის
// შემდეგ NextAuth JWT session ლოკალურად ჯერ კიდევ ვადაშია, მაგრამ ბექენდი
// ყველა authenticated request-ზე 401-ს დააბრუნებს — ამ შემთხვევაში
// session/cookie უნდა გავასუფთაოთ და მომხმარებელი login-ზე გადავამისამართოთ.
export const handleUnauthorizedResponse = (error: any) => {
  // მხოლოდ client-side-ზე — signOut() next-auth/react-დან SSR-ზე არ მუშაობს.
  if (SSR || typeof window === "undefined") {
    return;
  }

  const requestUrl: string = error?.config?.url ?? "";
  const isExcludedEndpoint = AUTH_ENDPOINTS_EXCLUDED_FROM_AUTO_LOGOUT.some(
    (path) => requestUrl.includes(path)
  );

  if (isExcludedEndpoint || isLoggingOutDueToExpiredSession) {
    return;
  }

  isLoggingOutDueToExpiredSession = true;

  // toast-ს აქ არ ვაჩვენებთ — window.location.replace მაშინვე ცვლის
  // გვერდს, ამიტომ toast არ ასწრებს გამოჩენას; login გვერდი
  // `sessionExpired` query-ს დანახვისას თავად აჩვენებს შეტყობინებას.
  signOut({ redirect: false }).finally(() => {
    window.location.replace("/login?sessionExpired=1");
  });
};

// Helper function to create axios instance with interceptors
const createAxiosInstance = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = axios.create({
    ...config,
    headers: {
      "accept-language": acceptLanguage ?? "ka",
      os: "web",
    },
  });

  // Request interceptor for authorization
  axiosInstance.interceptors.request.use((req: any) => {
    if (accessToken) {
      req.headers.Authorization = `Bearer ${accessToken}`;
    }

    return req;
  });

  // Response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle socket errors and connection issues
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        console.error("Request timeout:", error.message);
      } else if (
        error.code === "ECONNRESET" ||
        error.message?.includes("socket")
      ) {
        console.error("Socket connection error:", error.message);
      }

      // ბექენდის 401 (მაგ. მომხმარებელი ადმინმა წაშალა, მაგრამ JWT session
      // ლოკალურად ჯერ კიდევ ვადაშია) — ავტომატური logout + redirect.
      if (error?.response?.status === 401) {
        handleUnauthorizedResponse(error);
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const AuthAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new AuthApi(ApiConfig, API_URL, axiosInstance);
};

export const CategoriesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new CategoriesApi(ApiConfig, API_URL, axiosInstance);
};

export const ProductsAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new ProductsApi(ApiConfig, API_URL, axiosInstance);
};

export const UserAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new UsersApi(ApiConfig, API_URL, axiosInstance);
};

export const CartAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new CartApi(ApiConfig, API_URL, axiosInstance);
};

export const OrdersAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new OrdersApi(ApiConfig, API_URL, axiosInstance);
};

export const PaymentsAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new PaymentsApi(ApiConfig, API_URL, axiosInstance);
};

export const AttributesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new AttributesApi(ApiConfig, API_URL, axiosInstance);
};

export const FavoritesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new FavoritesApi(ApiConfig, API_URL, axiosInstance);
};

export const OtpAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new OtpApi(ApiConfig, API_URL, axiosInstance);
};

export const AddressesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new AddressesApi(ApiConfig, API_URL, axiosInstance);
};

export const BranchesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new BranchesApi(ApiConfig, API_URL, axiosInstance);
};

export const ColorsAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new ColorsApi(ApiConfig, API_URL, axiosInstance);
};

export const CompaniesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new CompaniesApi(ApiConfig, API_URL, axiosInstance);
};

export const HeroSlidesAPI = (acceptLanguage: string, accessToken: string) => {
  const axiosInstance = createAxiosInstance(acceptLanguage, accessToken);
  return new HeroSlidesApi(ApiConfig, API_URL, axiosInstance);
};


// პასკალიდან გადაყავს ქემელში
const toCamelCase = (o: any) => {
  var newO: any, origKey, newKey, value;
  if (o instanceof Array) {
    return o.map(function (value) {
      if (typeof value === "object") {
        value = toCamelCase(value);
      }
      return value;
    });
  } else {
    newO = {};
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        newKey = (
          origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey
        ).toString();
        value = o[origKey];
        if (
          value instanceof Array ||
          (value !== null && value.constructor === Object)
        ) {
          value = toCamelCase(value);
        }
        newO[newKey] = value;
      }
    }
  }
  return newO;
};
// --------------------------
