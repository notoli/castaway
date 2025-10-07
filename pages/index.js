// pages/index.js
import { useState, useEffect, useRef, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../styles/Home.module.css";
import { DarkModeContext } from "./_app";

const spotifyApi = new SpotifyWebApi();

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const searchRef = useRef(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch user's albums
  useEffect(() => {
    if (!session?.user) return;

    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      const { data: albumsData, error: albumsError } = await supabase
        .from("user_albums")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (albumsError) console.error("Error fetching albums:", albumsError);
      else setAlbums(albumsData || []);
      setLoadingAlbums(false);
    };

    fetchAlbums();
  }, [session]);

  // Spotify search
  async function searchAlbums(term) {
    if (!term || !session?.accessToken) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    spotifyApi.setAccessToken(session.accessToken);

    try {
      const result = await spotifyApi.searchAlbums(term, { limit: 5 });
      setSearchResults(result.albums.items);
      setDropdownOpen(true);
    } catch (err) {
      console.error("Spotify search error:", err);
    }
  }

  // Add album
  async function addAlbum(album) {
    if (!album || !session) return;
    if (albums.length >= 5) return alert("You can only add up to 5 albums.");
    if (albums.some((a) => a.album_id === album.id)) return alert("You already added this album!");

    const { data, error } = await supabase
      .from("user_albums")
      .insert({
        user_id: session.user.id,
        album_id: album.id,
        album_name: album.name,
        artist_name: album.artists[0]?.name,
        album_image: album.images[0]?.url || null,
      })
      .select();

    if (error) console.error("Supabase insert error:", error);
    else {
      setAlbums((prev) => [...prev, data[0]]);
      setSearchTerm("");
      setSearchResults([]);
      setDropdownOpen(false);
    }
  }

  // Delete album
  async function deleteAlbum(albumId, albumName) {
    if (!window.confirm(`Delete "${albumName}" from your top albums?`)) return;

    const { error } = await supabase
      .from("user_albums")
      .delete()
      .eq("id", albumId)
      .eq("user_id", session.user.id);

    if (!error) setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  }

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading" || !session) return null;

  return (
    <div
      className={`${styles.container} ${darkMode ? "dark" : ""}`}
      style={{ transition: "background 0.3s, color 0.3s" }}
    >
      {/* Header with right-aligned menu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0",
          borderBottom: "1px solid #ccc",
        }}
      >
        <h1>Your Albums</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className={styles.signoutButton}
            onClick={() => router.push("/community")}
          >
            Community
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

      {/* Saved albums */}
      {loadingAlbums ? (
        <p>Loading your albums…</p>
      ) : (
        <div className={styles.albumGrid}>
          {albums.map((a) => (
            <div key={a.id} className={styles.albumCard}>
              <button
                className={styles.deleteButton}
                onClick={() => deleteAlbum(a.id, a.album_name)}
                title="Delete album"
              >
                ×
              </button>
              {a.album_image && <img src={a.album_image} alt={a.album_name} />}
              <p style={{ fontWeight: "bold", margin: "0.5rem 0 0 0" }}>{a.album_name}</p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{a.artist_name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className={styles.searchContainer} ref={searchRef}>
        <h2>Search Spotify Albums</h2>
        {albums.length < 5 ? (
          <>
            <input
              type="text"
              value={searchTerm}
              placeholder="Search albums..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchAlbums(e.target.value);
              }}
              className={styles.searchInput}
            />
            {dropdownOpen && searchResults.length > 0 && (
              <ul className={styles.searchDropdown}>
                {searchResults.map((album) => (
                  <li key={album.id} onClick={() => addAlbum(album)}>
                    {album.images[0]?.url && <img src={album.images[0].url} alt={album.name} width={50} />}
                    <span>
                      {album.name} — {album.artists[0]?.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p>You’ve reached the maximum of 5 albums.</p>
        )}
      </div>
    </div>
  );
}
