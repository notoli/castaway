// lib/gtag.js
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Fire an event
export const pageview = (url) => {
  if (!GA_ID) return;
  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
