import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../../styles/Home.module.css";

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchAlbums();
    }
  }, [id]);

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.error(error);
    else setProfile(data);
  }

  async function fetchAlbums() {
    const { data, error } = await supabase
      .from("user_albums")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setAlbums(data);
  }

  if (!profile) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>{profile.name}'s Desert Island Albums</h1>

      <div className={styles.albumGrid}>
        {albums.map((a) => (
          <div key={a.id} className={styles.albumCard}>
            {a.album_image && <img src={a.album_image} alt={a.album_name} />}
            <p style={{ fontWeight: "bold" }}>{a.album_name}</p>
            <p style={{ color: "#555" }}>{a.artist_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
