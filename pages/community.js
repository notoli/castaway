import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Community() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, image")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setProfiles(data);
  }

  return (
    <div className={styles.container}>
      <h1>Community</h1>
      <p>Explore other users' Desert Island albums:</p>

      <div className={styles.albumGrid}>
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/profile/${profile.id}`}
            className={styles.albumCard}
            style={{ textDecoration: "none" }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={profile.image || "/default-avatar.png"}
                alt={profile.name}
                style={{ borderRadius: "50%", width: "80px", height: "80px", marginBottom: "0.5rem" }}
              />
              <p style={{ fontWeight: "bold", color: "#2a4d4f" }}>{profile.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
