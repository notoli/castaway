import { signIn } from "next-auth/react";
import styles from "../styles/Login.module.css";

export default function Login() {
  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginTitle}>Desert Island Albums</h1>
      <p className={styles.loginDescription}>
        Save your top 5 albums and create your personal Desert Island playlist. Sign in with Spotify to get started.
      </p>
      <button
        className={styles.loginButton}
        onClick={() =>
          signIn("spotify", { callbackUrl: "/" })
        }
      >
        Sign in with Spotify
      </button>
    </div>
  );
}
