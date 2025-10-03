import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);
  const dropdownRef = useRef(null);

  // -----------------------------
  // Load user's saved albums
  // -----------------------------
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAlbums = async () => {
      const { data, error } = await supabase
        .from("user_albums")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) console.error("Supabase fetch error:", error);
      if (data) setMyAlbums(data);
    };

    fetchAlbums();
  }, [session]);

  // -----------------------------
  // Debounced Spotify search
  // -----------------------------
  useEffect(() => {
    if (!query || !session?.accessToken) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`,
          { headers: { Authorization: `Bearer ${session.accessToken}` } }
        );
        const data = await res.json();
        setResults(data.albums?.items || []);
      } catch (err) {
        console.error("Spotify search error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, session]);

  // -----------------------------
  // Add album
  // -----------------------------
  const addAlbum = async (album) => {
    console.log("Clicked album:", album);

    if (!session?.user?.id) {
      console.log("No session.user.id! Current session.user:", session.user);
      return;
    }

    if (myAlbums.length >= 5) {
      console.log("Top 5 albums reached");
      return;
    }

    if (myAlbums.some((a) => a.album_id === album.id)) {
      console.log("Album already added");
      return;
    }

    const { data, error } = await supabase.from("user_albums").insert([
      {
        user_id: session.user.id,
        album_id: album.id,
        album_name: album.name,
        artist_name: album.artists[0].name,
        album_image: album.images[2]?.url || album.images[0]?.url,
      },
    ]);

    console.log("Supabase insert data:", data);
    console.log("Supabase insert error:", error);

    if (data) {
      setMyAlbums([...myAlbums, data[0]]);
      setQuery(""); // clear input
      setResults([]); // close dropdown
    }
  };

  // -----------------------------
  // Remove album
  // -----------------------------
  const removeAlbum = async (album) => {
    if (!album.id) return;
    const { error } = await supabase.from("user_albums").delete().eq("id", album.id);
    if (!error) setMyAlbums(myAlbums.filter((a) => a.id !== album.id));
    else console.error("Supabase delete error:", error);
  };

  // -----------------------------
  // Close dropdown on outside click
  // -----------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----------------------------
  // Render
  // -----------------------------
  if (!session) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Welcome to Castaway 🎶</h1>
        <button
          onClick={() => signIn("spotify")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Sign in with Spotify
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Hi {session.user.name} 👋</h1>
        <button
          onClick={() => signOut()}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "#e0245e",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginBottom: "40px",
          }}
        >
          Sign out
        </button>
      </div>

      <h2>Choose Your Top 5 Albums</h2>
      <div style={{ position: "relative", overflow: "visible" }} ref={dropdownRef}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an album..."
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {results.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #ccc",
              borderTop: "none",
              maxHeight: "200px",
              overflowY: "auto",
              position: "absolute",
              width: "100%",
              backgroundColor: "white",
              zIndex: 999,
            }}
          >
            {results.map((album) => (
              <li key={album.id} style={{ padding: 0 }}>
                <button
                  onClick={() => addAlbum(album)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={album.images[2]?.url || album.images[0]?.url}
                    width="40"
                    height="40"
                    alt={album.name}
                    style={{ borderRadius: "3px" }}
                  />
                  <div style={{ flex: "1" }}>
                    <strong>{album.name}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {album.artists[0].name}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 style={{ marginTop: "40px" }}>My Top Albums</h3>
      {myAlbums.length === 0 && <p>No albums chosen yet.</p>}
      {myAlbums.map((a, i) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <img
            src={a.album_image}
            width="40"
            height="40"
            alt={a.album_name}
            style={{ borderRadius: "3px" }}
          />
          <span>
            {i + 1}. {a.album_name} – {a.artist_name}
          </span>
          <button
            onClick={() => removeAlbum(a)}
            style={{
              marginLeft: "auto",
              padding: "4px 8px",
              fontSize: "12px",
              cursor: "pointer",
              backgroundColor: "#e0245e",
              color: "white",
              border: "none",
              borderRadius: "3px",
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
