import {
  AttributesApi,
  AuthApi,
  CartApi,
  CategoriesApi,
  Configuration,
  OrdersApi,
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
