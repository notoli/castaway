// pages/privacy.js
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="mb-2">
        This app (“we”, “our”, or “us”) respects your privacy. This policy explains how we collect, use, and store your personal information.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Data We Collect</h2>
      <ul className="list-disc list-inside mb-2">
        <li>Spotify ID and username</li>
        <li>Email address (from Spotify authentication)</li>
        <li>Profile picture URL (optional)</li>
        <li>Albums you interact with in the app</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-4 mb-2">How We Use Your Data</h2>
      <p className="mb-2">
        Your data is used to provide the core functionality of the app: saving and displaying your favorite albums, and creating personalized content.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Your Rights</h2>
      <ul className="list-disc list-inside mb-2">
        <li>You can request a copy of your data at any time.</li>
        <li>You can delete your account and all associated data by using the “Delete Account” button in your profile.</li>
        <li>You can withdraw consent to data usage at any time.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Data Retention</h2>
      <p className="mb-2">
        We retain your data only as long as necessary for the app’s functionality or to comply with legal obligations. Inactive accounts may be removed after a set period.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Third-Party Services</h2>
      <p className="mb-2">
        We use Spotify’s API for authentication and profile information. Your data is never shared with other services without your consent.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Contact</h2>
      <p>
        For privacy questions or data deletion requests, contact us at: <a href="mailto:privacy@yourapp.com" className="text-blue-600">privacy@yourapp.com</a>
      </p>
    </div>
  );
}
