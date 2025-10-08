import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    return res.status(200).json({ session });
  } catch (err) {
    console.error("Session test failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
