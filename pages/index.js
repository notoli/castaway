import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Hi {session.user.name} 👋</h1>
      <p>You’re signed in with Spotify ({session.user.email})</p>
      {session.user.image && (
        <img
          src={session.user.image}
          alt="Profile picture"
          style={{ borderRadius: "50%", marginTop: "20px" }}
        />
      )}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => signOut()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#e0245e",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
