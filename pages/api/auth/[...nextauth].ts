import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import GoogleProvider from "next-auth/providers/google"; // ← ეს
import FacebookProvider from "next-auth/providers/facebook"; // ← ახალი იმპორტი

export const authOptions: NextAuthOptions = {
  providers: [

     // ← 2. დაამატე Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

     FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,public_profile', // ← აუცილებელია email-ის მისაღებად
        },
      },
    }),

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

  secret: process.env.NEXTAUTH_SECRET || "your-super-secret-key",

  callbacks: {

// ⭐ 3. ახალი signIn callback: Google-ით შესვლისას ვუკავშირდებით ბექენდს
        async signIn({ user, account, profile }) {
    // მხოლოდ OAuth პროვაიდერებისთვის (Google, Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // Facebook-ის profile სტრუქტურა განსხვავებულია:
          // - Google: given_name, family_name
          // - Facebook: name (სრული სახელი ერთ ველში)
          let firstName = "";
          let lastName = "";

          if (account.provider === "google") {
            firstName = (profile as any)?.given_name || "";
            lastName = (profile as any)?.family_name || "";
          } else if (account.provider === "facebook") {
            // Facebook-ზე name არის "დათა ბერიძე" ფორმატში
            const fullName = (profile as any)?.name || "";
            const nameParts = fullName.split(" ");
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
          }

          // ვაგზავნით ბექენდზე
          const endpoint = account.provider === "google" ? "/auth/google" : "/auth/facebook";
          
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              firstName,
              lastName,
            }),
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
      }
      // პროფილის ფორმიდან useSession().update(...) გამოძახებისას აქ ვანახლებთ
      // token-ს, რომ ჰედერშიც (და ყველგან, სადაც session.user.name გამოიყენება)
      // დაუყოვნებლივ აისახოს ახალი სახელი/გვარი.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
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




