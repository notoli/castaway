import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { supabaseServer } from "../../lib/supabaseServer"; // use service role client for secure writes

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.method === "POST") {
      const { name, image } = req.body;

      const { data, error } = await supabaseServer
        .from("profiles")
        .upsert({
          id: session.user.id,
          name,
          image,
        });

      if (error) {
        console.error("Supabase upsert error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error("API /profile failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
