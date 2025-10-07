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
            await supabase.from("profiles").update({ image: spotifyUser.images[0].url }).eq("id", data.id);
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

  if (!user) return null;

  return (
    <div className={`${styles.container} ${darkMode ? "dark" : ""}`} style={{ transition: "background 0.3s, color 0.3s" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1rem 0",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Profile</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className={styles.signoutButton} onClick={() => router.push("/community")}>
              Back
            </button>
            <button className={styles.signoutButton} onClick={() => signOut()}>
              Sign out
            </button>
            <button className={styles.darkModeButton} onC
