import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);

  // Function to search Spotify for albums
  const searchAlbums = async () => {
    if (!query || !session?.accessToken) return;
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );
    const data = await res.json();
    setResults(data.albums?.items || []);
  };

  if (!session) {
    // Logged out screen
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Welcome to Castaway 🎶</h1>
        <p>Please sign in with Spotify to continue</p>
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

  // Logged in screen
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Hi {session.user.name} 👋</h1>
        <p>You’re signed in with Spotify ({session.user.email})</p>
        {session.user.image && (
          <img
            src={session.user.image}
            alt="Profile picture"
            style={{ borderRadius: "50%", margin: "20px auto", display: "block" }}
          />
        )}
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

      {/* Album chooser */}
      <h2>Choose Your Top 5 Albums</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an album..."
          style={{
            flex: "1",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={searchAlbums}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Search
        </button>
      </div>

      <div>
        {results.map((album) => (
          <div
            key={album.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "10px",
            }}
          >
            <img src={album.images[0]?.url} width="60" alt={album.name} />
            <div style={{ flex: "1" }}>
              <strong>{album.name}</strong> – {album.artists[0].name}
            </div>
            <button
              disabled={myAlbums.length >= 5}
              onClick={() => setMyAlbums([...myAlbums, album])}
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: "#1DB954",
                color: "white",
                border: "none",
                borderRadius: "3px",
              }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "40px" }}>My Top Albums</h3>
      {myAlbums.length === 0 && <p>No albums chosen yet.</p>}
      {myAlbums.map((a, i) => (
        <div key={a.id} style={{ marginBottom: "8px" }}>
          {i + 1}. {a.name} – {a.artists[0].name}
        </div>
      ))}
    </div>
  );
}
