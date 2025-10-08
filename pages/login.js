import { signIn } from "next-auth/react";
import styles from "../styles/Login.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Desert Island Albums</h1>
      <p className={styles.description}>
        Sign in with Spotify to get started.
      </p>
      <button
        className={styles.loginButton}
        onClick={() => signIn("spotify", { callbackUrl: "/" })}
      >
        Sign in with Spotify
      </button>
    </div>
  );
}
