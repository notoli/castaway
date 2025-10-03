import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // ensures NEXTAUTH_URL is respected on Vercel
callbacks: {
  async jwt({ token, account, user }) {
    if (account) {
      token.accessToken = account.access_token;
      token.refreshToken = account.refresh_token;
      token.id = user.id; // add the user ID to the token
    }
    return token;
  },
  async session({ session, token }) {
    session.accessToken = token.accessToken;
    session.refreshToken = token.refreshToken;
    session.user.id = token.id; // now session.user.id exists
    return session;
  },
},

});
