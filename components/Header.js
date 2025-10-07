// components/Header.js
import { useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { DarkModeContext } from "../pages/_app";

export default function Header({ mainTitle, pageTitle, backButtonPath }) {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { data: session } = useSession();

  return (
    <div className={styles.header}>
      <h1>{mainTitle}</h1>

      <div className={styles.headerButtons}>
        {backButtonPath && (
          <button
            className={styles.signoutButton}
            onClick={() => router.push(backButtonPath)}
          >
            Back
          </button>
        )}

        {session && (
          <>
            <button
              className={styles.signoutButton}
              onClick={() => router.push("/community")}
            >
              Community
            </button>
            <button
              className={styles.signoutButton}
              onClick={() => signOut()}
            >
              Sign out
            </button>
            <button
              className={styles.darkModeButton} // revert to separate class
              onClick={toggleDarkMode}
            >
              {darkMode ? "Dark Mode On" : "Dark Mode Off"}
            </button>
          </>
        )}
      </div>

      {/* Line under header */}
      <hr style={{ width: "100%", margin: "0.5rem 0", borderColor: "#ccc" }} />
      {/* Page title under line */}
      <h2 style={{ marginTop: "0.5rem", fontWeight: "normal", color: "#555" }}>
        {pageTitle}
      </h2>
    </div>
  );
}
