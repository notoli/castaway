// pages/api/consent.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { supabaseServer } from "../../lib/supabaseServer"; // ✅ use your existing server client

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { consent_status } = req.body;

    if (!["accepted", "declined"].includes(consent_status)) {
      return res.status(400).json({ error: "Invalid consent status" });
    }

    const payload = {
      spotify_user_id: session.user.id, // Spotify user ID as text
      consent_status,
      consent_date: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("user_consent")
      .upsert(payload, { onConflict: "spotify_user_id" });

    if (error) {
      console.error("Supabase upsert error (user_consent):", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  }

  res.setHeader("Allow", "POST");
  res.status(405).end("Method Not Allowed");
}
