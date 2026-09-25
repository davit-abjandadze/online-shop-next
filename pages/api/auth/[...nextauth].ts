import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// login გვერდი ამ კოდს result.error-ში ამოიცნობს (იხ. components/pages/login)
export const TOO_MANY_ATTEMPTS_ERROR = "TOO_MANY_ATTEMPTS";
import GoogleProvider from "next-auth/providers/google"; // ← ეს
// import FacebookProvider from "next-auth/providers/facebook"; // ⚠️ დროებით გამორთულია (Facebook App ჯერ Development/Unpublished რეჟიმშია)

export const authOptions: NextAuthOptions = {
  providers: [

     // ← 2. დაამატე Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ⚠️ დროებით გამორთულია Facebook Provider (Facebook App ჯერ Development/Unpublished რეჟიმშია)
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       scope: 'email,public_profile', // ← აუცილებელია email-ის მისაღებად
    //     },
    //   },
    // }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const loginData = {
          email: String(credentials.email),
          password: String(credentials.password),
        };
        
        const targetUrl = `${API_URL}/auth/login`;

        try {
          const response = await axios.post(targetUrl, loginData, {
            headers: {
              "Content-Type": "application/json",
            },
            validateStatus: () => true,
          });

          const data = response.data;

          // ბექენდი ერთ ელფოსტაზე 10 წარუმატებელი ცდის შემდეგ 15 წუთით ბლოკავს
          // (429). NextAuth-ში authorize-იდან ნასროლი Error-ის message
          // signIn()-ის result.error-ში მოდის — login გვერდი ცალკე ტექსტს
          // აჩვენებს "არასწორი პაროლის" ნაცვლად.
          if (response.status === 429) {
            throw new Error(TOO_MANY_ATTEMPTS_ERROR);
          }

          if (response.status !== 200 || !data || !data.access_token || !data.user) {
            return null;
          }

          return {
            id: String(data.user.id),
            name: data.user.firstName && data.user.lastName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.email,
            email: data.user.email,
            access_token: data.access_token,
            role: data.user.role,
          };
        } catch (error: any) {
          if (error?.message === TOO_MANY_ATTEMPTS_ERROR) {
            throw error;
          }
          console.error("NextAuth Authorize Error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error(
        "NEXTAUTH_SECRET გარემოს ცვლადი არ არის დაყენებული — JWT სესიების ხელმოწერისთვის აუცილებელია, hardcoded fallback-ი უსაფრთხოების რისკს ქმნის."
      );
    }
    return process.env.NEXTAUTH_SECRET;
  })(),

  callbacks: {

// ⭐ 3. ახალი signIn callback: Google-ით შესვლისას ვუკავშირდებით ბექენდს
        async signIn({ user, account }) {
    // მხოლოდ OAuth პროვაიდერებისთვის (Google, Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // ⚠️ ბექენდის /auth/google და /auth/facebook აღარ ენდობიან კლიენტისგან
          // გამოგზავნილ email/firstName/lastName-ს (account takeover-ის პრევენცია) —
          // ადრე Facebook-ის შტოს ჩამორჩენოდა Google-ისთვის უკვე გასწორებული ეს
          // ხვრელი: profile.name/user.email პირდაპირ იგზავნებოდა ბექენდში, რაც
          // ნებისმიერს საშუალებას აძლევდა Facebook-ის ნებისმიერი (თუნდაც არავერიფიცირებული)
          // ანგარიშით შესულიყო ვინმეს არსებულ email-ზე. ახლა ორივე პროვაიდერისთვის
          // მხოლოდ Facebook/Google-ის ნამდვილ ტოკენს ვაბარებთ ბექენდს, რომელიც თავად
          // ამოწმებს მას (Google — id_token-ის ხელმოწერას/aud/ვადას, Facebook —
          // access_token-ს Graph API-ის debug_token-ით) და email/სახელს მხოლოდ
          // ვერიფიცირებული პასუხიდან იღებს (იხ. AuthService.googleLogin/facebookLogin).
          const endpoint = account.provider === "google" ? "/auth/google" : "/auth/facebook";

          const body =
            account.provider === "google"
              ? { idToken: account.id_token }
              : { accessToken: account.access_token };

          const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data = await response.json();

          if (response.ok && data.access_token) {
            (user as any).access_token = data.access_token;
            (user as any).role = data.user.role;
            (user as any).id = String(data.user.id);
            return true;
          }
          return false;
        } catch (error) {
          console.error(`${account.provider} Sign In Error:`, error);
          return false;
        }
      }
      return true; // Credentials-ისთვის
    },



    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.access_token = (user as any).access_token;
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.roleCheckedAt = Date.now();
      }
      // პროფილის ფორმიდან useSession().update(...) გამოძახებისას აქ ვანახლებთ
      // token-ს, რომ ჰედერშიც (და ყველგან, სადაც session.user.name გამოიყენება)
      // დაუყოვნებლივ აისახოს ახალი სახელი/გვარი.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // ⚠️ FIX: role დემოტირების შემდეგ ადმინის წვდომა 7 დღემდე რჩებოდა, რადგან
      // JWT session-ს (maxAge: 7 დღე) role მხოლოდ login-ისას ედება და მერე აღარ
      // ბრუნდება ბექენდთან გადასამოწმებლად. აქედან გამომდინარე, role-ს პერიოდულად
      // (5 წუთში ერთხელ) ვახლებთ ბექენდიდან, რომ დემოტირება/დაბლოკვა სწრაფად აისახოს
      // და არა მხოლოდ ხელახალი login-ის ან token-ის ვადის გასვლის შემდეგ.
      const ROLE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
      const lastChecked = (token.roleCheckedAt as number) || 0;
      if (token.id && token.access_token && Date.now() - lastChecked > ROLE_CHECK_INTERVAL_MS) {
        try {
          const response = await axios.get(`${API_URL}/users/${token.id}`, {
            headers: { Authorization: `Bearer ${token.access_token}` },
            validateStatus: () => true,
            timeout: 5000,
          });

          if (response.status === 200 && response.data?.role) {
            token.role = response.data.role;
            token.roleCheckedAt = Date.now();
          } else if (response.status === 401 || response.status === 404) {
            // მომხმარებელი წაშლილია ან access_token აღარ არის ვალიდური —
            // token-ს ვასუფთავებთ, session callback-ში role აღარ ექნება.
            token.role = undefined;
            token.roleCheckedAt = Date.now();
          }
        } catch (error) {
          // ქსელური/დროებითი შეცდომისას ძველ role-ს ვტოვებთ უცვლელად, რომ
          // backend-ის დროებითმა მიუწვდომლობამ არ დაბლოკოს მომხმარებელი.
          console.error("Role re-check failed:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.access_token as string;
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).id = token.id ?? (token.sub as string);
        }
      }
      return session;
    },
  },
};

const nextAuthHandler = NextAuth(authOptions);

export default async function handler(req: any, res: any) {
  // Next.js Dev Server-ის ცნობილი ბაგის პრევენცია:
  // 401 სტატუსის დროს Dev Server ცდილობს შიდა _error გვერდის ჩატვირთვას.
  // 401-ის 200-ით ჩანაცვლებით NextAuth-ის { url: "...?error=CredentialsSignin" } პასუხი
  // უპრობლემოდ მიეწოდება კლიენტს (signIn) და ფრონტზე გამოაქვს არასწორი პაროლის შეტყობინება 500-ის გარეშე.
  const originalStatus = res.status.bind(res);
  res.status = (statusCode: number) => {
    if (statusCode === 401 && req.url?.includes("callback/credentials")) {
      return originalStatus(200);
    }
    return originalStatus(statusCode);
  };

  try {
    return await nextAuthHandler(req, res);
  } catch (err: any) {
    return originalStatus(500).json({ error: err?.message || String(err) });
  }
}




