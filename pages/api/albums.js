// pages/api/albums.js
import { supabaseServer } from "../../lib/supabaseServer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method === "POST") {
    const { album_id, album_name, artist_name, album_image } = req.body;

    try {
      const { data, error } = await supabaseServer
        .from("user_albums")
        .insert({
          user_id: session.user.id,
          album_id,
          album_name,
          artist_name,
          album_image,
        })
        .select(); // return inserted row

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

  if (req.method === "DELETE") {
    const { id } = req.body; // id of the album row

    try {
      const { error } = await supabaseServer
        .from("user_albums")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
