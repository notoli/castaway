// pages/login.js
import { signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Login() {
  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginTitle}>Desert Island Albums</h1>
      <p className={styles.loginDescription}>
        Save your top 5 albums and create your personal Desert Island playlist. Sign in with Spotify to get started.
      </p>
      <button
        className={styles.loginButton}
        onClick={() => signIn("spotify")}
      >
        Sign in with Spotify
      </button>
    </div>
  );
}
