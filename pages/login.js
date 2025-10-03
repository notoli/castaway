// pages/login.js
import { signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Login() {
  return (
    <div
      className={styles.container}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", color: "#2a4d4f", marginBottom: "1rem" }}>
        Desert Island Albums
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          color: "#555",
          marginBottom: "2rem",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Save your top 5 albums and create your personal Desert Island playlist. Sign in with Spotify to get started.
      </p>
      <button
        className={styles.signoutButton}
        onClick={() => signIn("spotify")}
        style={{ padding: "0.75rem 2rem", fontSize: "1rem", boxShadow: "0 3px 8px rgba(0,0,0,0.2)" }}
      >
        Sign in with Spotify
      </button>
    </div>
  );
}
