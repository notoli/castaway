import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { supabaseServer } from "../../lib/supabaseServer";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { public: isPublic } = req.body;

  const { data, error } = await supabaseServer
    .from("profiles")
    .update({ public: isPublic })
    .eq("id", session.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
