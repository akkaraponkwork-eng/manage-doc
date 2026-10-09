export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-gray-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>This application only requires access to your Google Drive to store and retrieve documents you upload through the system. We do not access, collect, or store any other personal information from your Google account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>The Google Drive access is used strictly for the core functionality of the application: uploading files to your designated folder and downloading files for viewing within the app.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data Sharing</h2>
            <p>We do not share, sell, or transfer your data or Google Drive contents to any third parties.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
