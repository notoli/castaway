import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function MyApp({
  Component,
  pageProps,
}: AppProps & { Component: React.ComponentType<any>; pageProps: { session?: any } }) {
  return (
    <SessionProvider session={(pageProps as any).session} refetchInterval={0}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
