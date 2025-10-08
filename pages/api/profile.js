export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "API route is working" });
    }

    return res.status(200).json({ message: "POST request OK" });
  } catch (err) {
    console.error("Basic test failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
