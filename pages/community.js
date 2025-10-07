// pages/community.js
import { useEffect, useState, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import Header from "../components/Header";
import { DarkModeContext } from "./_app";

const spotifyApi = new SpotifyWebApi();

export default function Community() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { darkMode } = useContext(DarkModeContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      if (session.accessToken) spotifyApi.setAccessToken(session.accessToken);
      fetchProfiles();
    }
  }, [session]);

  async function fetchProfiles() {
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      const updatedData = await Promise.all(
        data.map(async (user) => {
          if (!user.image) {
            try {
              const spotifyUser = await spotifyApi.getUser(user.id);
              if (spotifyUser?.images?.[0]?.url) {
                user.image = spotifyUser.images[0].url;
                await supabase
                  .from("profiles")
                  .update({ image: user.image })
                  .eq("id", user.id);
              }
            } catch (err) {
              console.warn(`Could not fetch Spotify avatar for ${user.name}:`, err);
            }
          }
          return user;
        })
      );

      setUsers(updatedData);
    } catch (err) {
      console.error(err);
    }
  }

  if (status === "loading") return null;

  return (
    <div className={`${styles.container} ${darkMode ? "dark" : ""}`}>
      <Header
        mainTitle="Community"
        pageTitle="Community"
        currentPath={router.pathname}
        userId={session?.user?.id}
      />

      <p>Explore other users' Desert Island albums:</p>

      <div className={styles.albumGrid}>
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className={styles.albumCard}
            style={{ textDecoration: "none" }}
          >
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name}
                  style={{
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    marginBottom: "0.5rem",
                  }}
                />
              )}
              <p style={{ fontWeight: "bold", color: "#2a4d4f" }}>
                {user.name}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                  marginTop: "0.5rem",
                }}
              >
                {user.user_albums?.slice(0, 3).map((album) => (
                  <img
                    key={album.album_id}
                    src={album.album_image || undefined}
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
