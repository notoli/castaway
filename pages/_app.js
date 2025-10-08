// pages/_app.js
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import "../styles/globals.css";
import { supabase } from "../lib/supabaseClient";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import Script from "next/script";
import * as gtag from "../lib/gtag";

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
  const consent = getCookieConsentValue("appCookieConsent") === "true";

  return (
    <SessionProvider session={session}>
      {/* ✅ Load GA only after consent */}
      {consent && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true });
              `,
            }}
          />
        </>
      )}

      <ProfileUpsert>
        <Component {...pageProps} />

        {/* ✅ GDPR Cookie Banner */}
        <CookieConsent
          location="bottom"
          cookieName="appCookieConsent"
          buttonText="Accept"
          declineButtonText="Decline"
          enableDeclineButton
          style={{
            background: "#222",
            color: "#fff",
            fontSize: "14px",
            padding: "1rem",
            zIndex: 9999,
          }}
          buttonStyle={{
            background: "#1DB954",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
          }}
          declineButtonStyle={{
            background: "#555",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
          }}
          expires={150}
          onAccept={() => {
            // reload to trigger GA load
            window.location.reload();
          }}
        >
          We use cookies necessary for this site to function and, with your consent,
          to measure usage via Google Analytics.{" "}
          <a href="/privacy" style={{ color: "#1DB954", textDecoration: "underline" }}>
            Learn more
          </a>
        </CookieConsent>
      </ProfileUpsert>
    </SessionProvider>
  );
}
