// pages/profile/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../../styles/Home.module.css";

const spotifyApi = new SpotifyWebApi();

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

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

      // If no image, try fetching from Spotify
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

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{user.name}</h1>
        <button className={styles.signoutButton} onClick={() => router.push("/community")}>
          ⬅ Back
        </button>
      </div>

      <div style={{ textAlign: "center" }}>
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

        <h2>Top Albums</h2>
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
