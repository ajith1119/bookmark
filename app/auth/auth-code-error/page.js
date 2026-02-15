export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          There was an error during the authentication process. Please try again.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
