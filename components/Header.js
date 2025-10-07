// components/Header.js
import { useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { DarkModeContext } from "../pages/_app";

export default function Header({ mainTitle, pageTitle, currentPath, userId }) {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { data: session } = useSession();

  return (
    <div className={styles.header}>
      <h1>{mainTitle}</h1>

      <div className={styles.headerButtons}>
        {session && (
          <>
            {/* Back button for profile pages */}
            {currentPath.startsWith("/profile/") && (
              <button
                className={styles.signoutButton}
                onClick={() => router.push("/community")}
                style={{ marginRight: "1rem" }}
              >
                Back
              </button>
            )}

            {/* Show Community button if not already on /community */}
            {currentPath !== "/community" && (
              <button
                className={styles.signoutButton}
                onClick={() => router.push("/community")}
                style={{ marginRight: "1rem" }}
              >
                Community
              </button>
            )}

            {/* Show My Albums button if not already on / */}
            {currentPath !== "/" && (
              <button
                className={styles.signoutButton}
                onClick={() => router.push("/")}
                style={{ marginRight: "1rem" }}
              >
                My Albums
              </button>
            )}

            {/* Show My Profile button if user is logged in and not on their profile */}
            {userId && !currentPath.startsWith(`/profile/${userId}`) && (
              <button
                className={styles.signoutButton}
                onClick={() => router.push(`/profile/${userId}`)}
                style={{ marginRight: "1rem" }}
              >
                My Profile
              </button>
            )}

            <button
              className={styles.signoutButton}
              onClick={() => signOut()}
              style={{ marginRight: "1rem" }}
            >
              Sign out
            </button>

            <button
              className={styles.darkModeButton}
              onClick={toggleDarkMode}
            >
              {darkMode ? "Dark Mode On" : "Dark Mode Off"}
            </button>
          </>
        )}
      </div>

      <hr style={{ width: "100%", margin: "0.5rem 0", borderColor: "#ccc" }} />
      <h2 style={{ marginTop: "0.5rem", fontWeight: "normal", color: "#555" }}>
        {pageTitle}
      </h2>
    </div>
  );
}
