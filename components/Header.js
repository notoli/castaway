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
    <div className={styles.headerContainer}>
      {/* Top row: main title + buttons */}
      <div className={styles.headerTop}>
        <h1>{mainTitle}</h1>

        <div className={styles.headerButtons}>
          {session && (
            <>
              {currentPath.startsWith("/profile/") && (
                <button
                  className={styles.signoutButton}
                  onClick={() => router.push("/community")}
                >
                  Back
                </button>
              )}

              {currentPath !== "/community" && (
                <button
                  className={styles.signoutButton}
                  onClick={() => router.push("/community")}
                >
                  Community
                </button>
              )}

              {currentPath !== "/" && (
                <button
                  className={styles.signoutButton}
                  onClick={() => router.push("/")}
                >
                  My Albums
                </button>
              )}

              <button
                className={styles.signoutButton}
                onClick={() => signOut()}
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
      </div>

      {/* Bottom row: line + page subtitle */}
      <hr className={styles.headerLine} />
      <h2 className={styles.pageTitle}>{pageTitle}</h2>
    </div>
  );
}
