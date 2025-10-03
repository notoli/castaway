// pages/index.js
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { supabase } from "../utils/supabaseClient"; // your Supabase client
import SpotifyWebApi from "spotify-web-api-js";

const spotifyApi = new SpotifyWebApi();

export default function Home() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);

  // Load user's saved albums
  useEffect(() => {
    if (session) {
      fetchUserAlbums();
    }
  }, [session]);

  async function fetchUserAlbums() {
    const { data, error } = await supabase
      .from("user_albums")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) console.error("Error fetching albums:", error);
    else setAlbums(data);
  }

  // Search Spotify albums
  async function searchAlbums(term) {
    if (!term) {
      setSearchResults([]);
      return;
    }

    // Set your access token
    spotifyApi.setAccessToken(session.accessToken);

    try {
      const result = await spotifyApi.searchAlbums(term, { limit: 5 });
      setSearchResults(result.albums.items);
    } catch (err) {
      console.error("Spotify search error:", err);
    }
  }

  // Add album to Supabase
  async function addAlbum(album) {
    const { data, error } = await supabase
      .from("user_albums")
      .insert({
        user_id: session.user.id,
        album_id: album.id,
        album_name: album.name,
        artist_name: album.artists[0]?.name,
        album_image: album.images[0]?.url || null,
      })
      .select(); // Return the inserted row

    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.log("Supabase insert data:", data);
      setAlbums(prev => [...prev, data[0]]);
      setSearchTerm("");
      setSearchResults([]);
    }
  }

  if (!session) {
    return (
      <div>
        <button onClick={() => signIn("spotify")}>Sign in with Spotify</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signOut()}>Sign out</button>

      <h1>Your Top Albums</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {albums.map(a => (
          <div key={a.id} style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
            {a.album_image && <img src={a.album_image} alt={a.album_name} width={100} />}
            <p>{a.album_name}</p>
            <p>{a.artist_name}</p>
          </div>
        ))}
      </div>

      <h2>Search Spotify Albums</h2>
      <input
        type="text"
        value={searchTerm}
        placeholder="Search albums..."
        onChange={e => {
          setSearchTerm(e.target.value);
          searchAlbums(e.target.value);
        }}
      />

      {searchResults.length > 0 && (
        <ul style={{ border: "1px solid #ccc", padding: 0, listStyle: "none" }}>
          {searchResults.map(album => (
            <li
              key={album.id}
              onClick={() => addAlbum(album)}
              style={{ cursor: "pointer", padding: "0.5rem", borderBottom: "1px solid #eee" }}
            >
              <img src={album.images[0]?.url} alt={album.name} width={50} style={{ marginRight: "0.5rem" }} />
              {album.name} — {album.artists[0]?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
