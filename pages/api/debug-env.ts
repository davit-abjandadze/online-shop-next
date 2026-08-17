import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    ENVIRONMENT: process.env.ENVIRONMENT || null,
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
  });
}
