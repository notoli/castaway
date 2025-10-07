import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import "../styles/globals.css";

function ProfileUpsert({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name,
          image: session.user.image,
        }),
      }).catch(console.error);
    }
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
