import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to
            <span className="block text-blue-600">WaveSync v1</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A modern maritime operations management system built … Next.js 14 and Supabase
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/auth"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need for maritime operations management
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ticket Management</h3>
              <p className="text-gray-600">Track and manage support tickets with priority levels and status tracking.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Certificate Tracking</h3>
              <p className="text-gray-600">Monitor certification validity and expiry dates for compliance.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Port Operations</h3>
              <p className="text-gray-600">Manage port-related operations and documentation efficiently.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Document Management</h3>
              <p className="text-gray-600">Centralized storage and organization of maritime documents.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sign-off Workflows</h3>
              <p className="text-gray-600">Streamlined approval processes with digital signatures.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Real-time Updates</h3>
              <p className="text-gray-600">Live synchronization across all devices and users.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}