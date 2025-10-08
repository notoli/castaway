import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { supabaseServer } from "../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      console.error("Missing user ID in session:", session);
      return res.status(401).json({ error: "Unauthorized — no session user ID" });
    }

    const userId = session.user.id; // Spotify user ID (text)
    const { name, image } = req.body;

    const { data, error } = await supabaseServer
      .from("profiles")
      .upsert(
        {
          id: userId, // Must be TEXT in your DB
          name: name || null,
          image: image || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select();

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Profile upserted successfully", data });
  } catch (err) {
    console.error("Profile API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
