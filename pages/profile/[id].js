// pages/profile/[id].js
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import { DarkModeContext } from "../_app";

const spotifyApi = new SpotifyWebApi();

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
      if (data?.accessToken) spotifyApi.setAccessToken(data.accessToken);
    }
    fetchSession();
  }, []);

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
          console.warn(err);
        }
      }

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <div className={`${styles.container} ${darkMode ? "dark" : ""}`}>
      <Header
        mainTitle={user.id}
        pageTitle={`${user.id}'s Albums`}
        currentPath={router.pathname}
        userId={session?.user?.id}
      />

      <div className={styles.profileContent}>
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
              {album.album_image && <img src={album.album_image} alt={album.album_name} />}
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
