// pages/index.js
import { useState, useEffect, useRef, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { DarkModeContext } from "./_app";

const spotifyApi = new SpotifyWebApi();

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { darkMode } = useContext(DarkModeContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const searchRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // ───────────────
  // Fetch user's albums
  // ───────────────
useEffect(() => {
  if (!session?.user) return;

  const fetchAlbums = async () => {
    setLoadingAlbums(true);

    try {
      // Select albums where either:
      // 1) The album belongs to the current user, OR
      // 2) The album belongs to a public profile
      const { data, error } = await supabase
        .from("user_albums")
        .select(`
          *,
          profiles (public)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter client-side: keep albums that are either:
      // - Owned by current user, OR
      // - Belong to a public profile
      const filteredAlbums = data.filter(
        (album) => album.user_id === session.user.id || album.profiles?.public
      );

      setAlbums(filteredAlbums || []);
    } catch (err) {
      console.error("Error fetching albums:", err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  fetchAlbums();
}, [session]);

  // ───────────────
  // Fetch current profile visibility
  // ───────────────
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("public")
        .eq("id", session.user.id)
        .single();
      if (error) console.error(error);
      else if (data) setPublicProfile(data.public);
    };

    fetchProfile();
  }, [session]);

  // ───────────────
  // Toggle public profile
  // ───────────────
  const togglePublicProfile = async () => {
    const newStatus = !publicProfile;
    const { data, error } = await supabase
      .from("profiles")
      .update({ public: newStatus })
      .eq("id", session.user.id);
    if (error) console.error("Error updating profile visibility:", error);
    else setPublicProfile(newStatus);
  };

  // ───────────────
  // Spotify search
  // ───────────────
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
      console.error(err);
    }
  }

// Add album
async function addAlbum(album) {
  if (!album || !session) return;
  if (albums.length >= 5) return alert("You can only add up to 5 albums.");
  if (albums.some((a) => a.album_id === album.id))
    return alert("You already added this album!");

  const res = await fetch("/api/albums", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      album_id: album.id,
      album_name: album.name,
      artist_name: album.artists[0]?.name,
      album_image: album.images[0]?.url || null,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error(result.error);
    return alert("Failed to add album.");
  }

  setAlbums((prev) => [...prev, result.data[0]]);
  setSearchTerm("");
  setSearchResults([]);
  setDropdownOpen(false);
}

// Delete album
async function deleteAlbum(albumId, albumName) {
  if (!window.confirm(`Delete "${albumName}" from your top albums?`)) return;

  const res = await fetch("/api/albums", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: albumId }),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error(result.error);
    return alert("Failed to delete album.");
  }

  setAlbums((prev) => prev.filter((a) => a.id !== albumId));
}

  // ───────────────
  // Close dropdown on outside click
  // ───────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading" || !session) return null;

  return (
    <div className={`${styles.container} ${darkMode ? "dark" : ""}`}>
      <Header
        mainTitle="Your Albums"
        pageTitle="My Albums"
        currentPath={router.pathname}
        userId={session.user.id}
      />

      {/* ─────────────── */}
      {/* Public Profile Toggle */}
      {/* ─────────────── */}
      <div style={{ margin: "1rem 0" }}>
        <label style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={publicProfile}
            onChange={togglePublicProfile}
            style={{ marginRight: "0.5rem" }}
          />
          Make my profile public
        </label>
      </div>

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
              <p style={{ fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
                {a.album_name}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                {a.artist_name}
              </p>
            </div>
          ))}
        </div>
      )}

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
