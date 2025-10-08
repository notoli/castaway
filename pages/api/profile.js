// pages/api/profile.js
import { supabaseServer } from "../../lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method === "POST") {
    const { name, image } = req.body;

    try {
      // Use the server client so RLS does not block the insert/upsert
      const { data, error } = await supabaseServer
        .from("profiles")
        .upsert(
          { id: session.user.id, name, image },
          { onConflict: "id", returning: "representation" }
        );

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
