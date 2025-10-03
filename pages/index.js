// pages/index.js
import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { supabase } from "../libs/supabaseClient";
import SpotifyWebApi from "spotify-web-api-js";

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
      .select(); // returns the inserted row

    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.log("Supabase insert data:", data);
      setAlbums(prev => [...prev, data[0]]);
      setSearchTerm("");
      setSearchResults([]);
      setDropdownOpen(false);
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
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button onClick={() => signIn("spotify")}>Sign in with Spotify</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Your Top Albums</h1>
        <button onClick={() => signOut()}>Sign out</button>
      </div>

      {/* Saved albums */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {albums.map(a => (
          <div
            key={a.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "0.5rem",
              background: "#fff",
              textAlign: "center",
            }}
          >
            {a.album_image && <img src={a.album_image} alt={a.album_name} style={{ width: "100%" }} />}
            <p style={{ fontWeight: "bold", margin: "0.5rem 0 0 0" }}>{a.album_name}</p>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#555" }}>{a.artist_name}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginTop: "2rem" }} ref={searchRef}>
        <h2>Search Spotify Albums</h2>
        <input
          type="text"
          value={searchTerm}
          placeholder="Search albums..."
          onChange={e => {
            setSearchTerm(e.target.value);
            searchAlbums(e.target.value);
          }}
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", marginBottom: "0.5rem" }}
        />

        {dropdownOpen && searchResults.length > 0 && (
          <ul
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "250px",
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
            }}
          >
            {searchResults.map(album => (
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
      </div>
    </div>
  );
}
