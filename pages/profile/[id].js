// pages/profile/[id].js
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../../styles/Home.module.css";
import { DarkModeContext } from "../_app"; // adjust path if needed

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

  // Show background while loading to avoid white flash
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
      {/* Centered Header */}
      <header
        className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-2xl font-bold mb-4">{user.name || user.id}'s Albums</h1>
        <nav className="flex space-x-6">
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
        </nav>
      </header>

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
