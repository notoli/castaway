// pages/_app.js
import { createContext, useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import Script from "next/script";
import CookieConsent from "react-cookie-consent";
import "../styles/globals.css";

// ───────────────────────────────
// Dark Mode Context
// ───────────────────────────────
export const DarkModeContext = createContext();

function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored) setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// ───────────────────────────────
// Profile Upsert (runs on login)
// ───────────────────────────────
function ProfileUpsert({ children }) {
  const { data: session, status } = useSession();
  const [hasUpserted, setHasUpserted] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || hasUpserted) return;

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
          const errorBody = await res.text();
          console.error("Error upserting profile:", res.status, errorBody);
        } else {
          // consume JSON safely
          const data = await res.json().catch(() => null);
          console.log("Profile upserted:", data);
        }

        setHasUpserted(true); // only upsert once per login
      } catch (err) {
        console.error("Error upserting profile:", err);
      }
    };

    upsertProfile();
  }, [status, session, hasUpserted]);

  return children;
}

// ───────────────────────────────
// Cookie Consent + Analytics
// ───────────────────────────────
function CookieBanner() {
  const consentCookie =
    typeof window !== "undefined"
      ? document.cookie.includes("appCookieConsent=true")
      : false;

  return (
    <>
      {consentCookie && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-T51KSG2XN6"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T51KSG2XN6', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

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
        onAccept={async () => {
          try {
            await fetch("/api/consent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ consent_status: "accepted" }),
            });
            window.location.reload();
          } catch (err) {
            console.error("Error logging consent:", err);
          }
        }}
        onDecline={async () => {
          try {
            await fetch("/api/consent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ consent_status: "declined" }),
            });
          } catch (err) {
            console.error("Error logging consent:", err);
          }
        }}
      >
        We use cookies necessary for this site to function and, with your
        consent, to measure usage via Google Analytics.{" "}
        <a
          href="/privacy"
          style={{ color: "#1DB954", textDecoration: "underline" }}
        >
          Learn more
        </a>
        .
      </CookieConsent>
    </>
  );
}

// ───────────────────────────────
// Main App Wrapper
// ───────────────────────────────
export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <DarkModeProvider>
        <ProfileUpsert>
          <Component {...pageProps} />
          <CookieBanner />
        </ProfileUpsert>
      </DarkModeProvider>
    </SessionProvider>
  );
}
