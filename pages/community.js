// pages/community.js
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Community() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch profiles with top albums
  useEffect(() => {
    if (session) fetchProfiles();
  }, [session]);

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        image,
        user_albums (
          album_id,
          album_name,
          artist_name,
          album_image
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setUsers(data);
    }
  }

  if (status === "loading") return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Community</h1>
        <div>
          <button className={styles.signoutButton} onClick={() => router.push("/")}>
            🏠 My Albums
          </button>
          <button className={styles.signoutButton} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>

      <p>Explore other users' Desert Island albums:</p>

      <div className={styles.albumGrid}>
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className={styles.albumCard}
            style={{ textDecoration: "none" }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={user.image || "/default-avatar.png"}
                alt={user.name}
                style={{
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  marginBottom: "0.5rem",
                }}
              />
              <p style={{ fontWeight: "bold", color: "#2a4d4f" }}>{user.name}</p>

              {/* Show up to 3 album previews */}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
                {user.user_albums?.slice(0, 3).map((album) => (
                  <img
                    key={album.album_id}
                    src={album.album_image || "/default-album.png"}
                    alt={album.album_name}
                    style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
