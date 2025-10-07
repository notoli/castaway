// pages/_app.js
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import "../styles/globals.css";
import { supabase } from "../lib/supabaseClient";

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
  return (
    <SessionProvider session={session}>
      <ProfileUpsert>
        <Component {...pageProps} />
      </ProfileUpsert>
    </SessionProvider>
  );
}
