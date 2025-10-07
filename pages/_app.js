// pages/_app.js
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState, createContext } from "react";
import "../styles/globals.css";
import { supabase } from "../lib/supabaseClient";

// Create a context for dark mode so pages can access it
export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

function ProfileUpsert({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const upsertProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.user.name || "",
            image: session.user.image || null,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          console.error("Error upserting profile:", error);
        }
      } catch (err) {
        console.error("Error upserting profile:", err);
      }
    };

    upsertProfile();
  }, [session]);

  return children;
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    // Add smooth transition on first load
    document.documentElement.style.transition = "background 0.3s, color 0.3s";
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next);
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <SessionProvider session={session}>
      <ProfileUpsert>
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
          <Component {...pageProps} />
        </DarkModeContext.Provider>
      </ProfileUpsert>
    </SessionProvider>
  );
}
