// pages/profile/[id].js
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../../styles/Home.module.css";
import { DarkModeContext } from "../_app";

const spotifyApi = new SpotifyWebApi();

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // Fetch session
  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
      if (data?.accessToken) spotifyApi.setAccessToken(data.accessToken);
    }
    fetchSession();
  }, []);

  // Fetch profile when session and id are available
  useEffect(() => {
    if (id && session) fetchProfile();
  }, [id, session]);

  async function fetchProfile() {
    try {
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
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data.name) data.name = data.id; // fallback to id if name is empty

      // If no image, fetch from Spotify
      if (!data.image) {
        try {
          const spotifyUser = await spotifyApi.getUser(data.id);
          if (spotifyUser?.images?.[0]?.url) {
            await supabase
              .from("profiles")
              .update({ image: spotifyUser.images[0].url })
              .eq("id", data.id);
            data.image = spotifyUser.images[0].url;
          }
        } catch (err) {
          console.warn(`Could not fetch Spotify avatar for ${data.name}:`, err);
        }
      }

      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  if (!user)
    return (
      <div
        className={`${darkMode ? "dark" : ""}`}
        style={{
          minHeight: "100vh",
          background: darkMode ? "#111" : "#f5f5f5",
          transition: "background 0.3s",
        }}
      />
    );

  return (
    <div
      className={`${styles.container} ${darkMode ? "dark" : ""}`}
      style={{ transition: "background 0.3s, color 0.3s" }}
    >
      {/* Header with title left, buttons right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0",
          borderBottom: "1px solid #ccc",
        }}
      >
        <h1>{user.name}'s Albums</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className={styles.signoutButton}
            onClick={() => router.push("/community")}
          >
            Back
          </button>
          <button
            className={styles.signoutButton}
            onClick={() => router.push("/")}
          >
            Home
          </button>
          <button
            className={styles.signoutButton}
            onClick={() => signOut()}
          >
            Sign out
          </button>
          <button
            className={styles.darkModeButton}
            onClick={toggleDarkMode}
          >
            {darkMode ? "Dark Mode On" : "Dark Mode Off"}
          </button>
        </div>
      </div>

      {/* Profile Image and Albums */}
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        {user.image && (
          <img
            src={user.image}
            alt={user.name}
            style={{
              borderRadius: "50%",
              width: "100px",
              height: "100px",
              marginBottom: "1rem",
            }}
          />
        )}

        <div className={styles.albumGrid}>
          {user.user_albums?.map((album) => (
            <div key={album.album_id} className={styles.albumCard}>
              {album.album_image && (
                <img src={album.album_image} alt={album.album_name} />
              )}
              <p style={{ fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
                {album.album_name}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                {album.artist_name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
