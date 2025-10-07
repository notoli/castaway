import { supabase } from "../../lib/supabaseClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions"; // <- import from the shared module

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "POST") {
    const { name, image } = req.body;

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, name, image });

    if (error) return res.status(400).json({ error });

    return res.status(200).json({ data });
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
