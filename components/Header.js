// components/Header.js
import { useContext } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import styles from "../styles/Home.module.css";
import { DarkModeContext } from "../pages/_app";

export default function Header({ mainTitle, pageTitle, backButtonPath }) {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1rem 0",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{mainTitle}</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {backButtonPath && (
            <button className={styles.signoutButton} onClick={() => router.push(backButtonPath)}>
              Back
            </button>
          )}
          <button className={styles.signoutButton} onClick={() => router.push("/community")}>
            Community
          </button>
          <button className={styles.signoutButton} onClick={() => signOut()}>
            Sign out
          </button>
          <button className={styles.darkModeButton} onClick={toggleDarkMode}>
            {darkMode ? "Dark Mode On" : "Dark Mode Off"}
          </button>
        </div>
      </div>
      <p style={{ marginTop: "0.5rem", fontWeight: "500", color: "#555" }}>{pageTitle}</p>
    </div>
  );
}
