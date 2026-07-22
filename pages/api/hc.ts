import type { NextApiRequest, NextApiResponse } from "next";

// Health check endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: "ok" });
}
