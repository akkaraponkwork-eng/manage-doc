export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-4 text-gray-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use of Service</h2>
            <p>This service allows you to manage documents by linking to your Google Drive account. You are responsible for maintaining the confidentiality of your account and files.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Google Drive Integration</h2>
            <p>The application interacts with Google Drive API to upload and view your files. You must comply with Google's Terms of Service when using this integration.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
