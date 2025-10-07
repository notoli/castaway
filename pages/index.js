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
  const searchRef = useRef(null);

// Handle login redirect only when status is resolved
useEffect(() => {
  if (status === "unauthenticated") {
    router.replace("/login");
  }
}, [status, router]);

// Show a loading state while checking session
if (status === "loading") {
  return (
    <div className={styles.container}>
      <p style={{ textAlign: "center", marginTop: "40vh", color: "#2a4d4f" }}>
        Checking session...
      </p>
    </div>
  );
}

// Don’t render private content if not logged in
if (!session) return null;

  // Fetch user's saved albums when authenticated
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

  // Add album
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

    if (!error) setAlbums((prev) => prev.filter((a) => a.id !== albumId));
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Desert Island Albums</h1>
        <button className={styles.signoutButton} onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <div className={styles.header}>
  <h1>Your Desert Island Albums</h1>
  <div>
    <button
      className={styles.signoutButton}
      onClick={() => router.push("/community")}
      style={{ marginRight: "1rem" }}
    >
      🌴 Community
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
