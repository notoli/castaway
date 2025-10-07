// pages/index.js
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../styles/Home.module.css";

const spotifyApi = new SpotifyWebApi();

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ------------------------------
  // DARK MODE
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", next);
      return next;
    });
  };
  // ------------------------------

  const searchRef = useRef(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Ensure profile exists and fetch user's albums
  useEffect(() => {
    if (!session?.user) return;

    const initProfileAndAlbums = async () => {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          name: session.user.name || "",
          image: session.user.image || null,
        });

      if (profileError) return console.error("Error upserting profile:", profileError);

      const { data: albumsData, error: albumsError } = await supabase
        .from("user_albums")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (albumsError) console.error("Error fetching albums:", albumsError);
      else setAlbums(albumsData);
    };

    initProfileAndAlbums();
  }, [session]);

  // Spotify search
  async function searchAlbums(term) {
    if (!term) {
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

  // Add album with max 5 and duplicate check
  async function addAlbum(album) {
    if (!album || !session) return;

    if (albums.length >= 5) {
      alert("You can only add up to 5 albums.");
      return;
    }

    if (albums.some((a) => a.album_id === album.id)) {
      alert("You already added this album!");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        name: session.user.name || "",
        image: session.user.image || null,
      });

    if (profileError) return console.error("Error upserting profile before album insert:", profileError);

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
    const confirmed = window.confirm(`Delete "${albumName}" from your top albums?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("user_albums")
      .delete()
      .eq("id", albumId)
      .eq("user_id", session.user.id);

    if (!error) setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  }

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading" || !session) return null;

  return (
    <div className={`${styles.container} ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Your Albums</h1>
        <div className={styles.headerButtons}>
          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode} className={styles.toggleWrapper}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* Existing buttons */}
          <button
            className={styles.signoutButton}
            onClick={() => router.push("/community")}
            style={{ marginRight: "1rem" }}
          >
            Community
          </button>
          <button className={styles.signoutButton} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>

      {/* Saved albums */}
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
                    {album.images[0]?.url && (
                      <img src={album.images[0].url} alt={album.name} width={50} />
                    )}
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
