import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <div>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <button onClick={() => signIn("spotify")}>Sign in with Spotify</button>
      )}
    </div>
  );
}
