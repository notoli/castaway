// pages/index.js
import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../styles/Home.module.css";

const spotifyApi = new SpotifyWebApi();

export default function Home() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Fetch user's saved albums
  useEffect(() => {
    if (session) fetchUserAlbums();
  }, [session]);

  async function fetchUserAlbums() {
    const { data, error } = await supabase
      .from("user_albums")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching albums:", error);
    else setAlbums(data);
  }

  // Search Spotify albums
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

  // Add album to Supabase
  async function addAlbum(album) {
    if (!album) return;

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

    if (error) {
      if (error.message.includes("You can only add up to 5 albums")) {
        alert("You can only add up to 5 albums.");
      } else {
        console.error("Supabase insert error:", error);
      }
    } else {
      setAlbums((prev) => [...prev, data[0]]);
      setSearchTerm("");
      setSearchResults([]);
      setDropdownOpen(false);
    }
  }

  // Delete album with confirmation
  async function deleteAlbum(albumId, albumName) {
    const confirmed = window.confirm(`Delete "${albumName}" from your top albums?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("user_albums")
      .delete()
      .eq("id", albumId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting album:", error);
    } else {
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    }
  }

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) {
    return (
      <div className={styles.container} style={{ textAlign: "center", paddingTop: "2rem" }}>
        <button className={styles.signoutButton} onClick={() => signIn("spotify")}>
          Sign in with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Desert Island Albums</h1>
        <button className={styles.signoutButton} onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      {/* Saved albums */}
      <div className={styles.albumGrid}>
        {albums.map((a) => (
          <div key={a.id} className={styles.albumCard}>
            {/* Delete cross */}
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
      <div style={{ marginTop: "2rem" }} ref={searchRef}>
        <h2 style={{ color: "#2a4d4f" }}>Search Spotify Albums</h2>

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
              style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", marginBottom: "0.5rem", borderRadius: "8px", border: "1px solid #bbb" }}
            />

            {dropdownOpen && searchResults.length > 0 && (
              <ul
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  maxHeight: "250px",
                  overflowY: "auto",
                  background: "#fff",
                  position: "absolute",
                  zIndex: 1000,
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {searchResults.map((album) => (
                  <li
                    key={album.id}
                    onClick={() => addAlbum(album)}
                    style={{
                      cursor: "pointer",
                      padding: "0.5rem",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {album.images[0]?.url && <img src={album.images[0].url} alt={album.name} width={50} />}
                    <span>{album.name} — {album.artists[0]?.name}</span>
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
