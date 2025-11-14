import { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're Offline - Aura",
  description:
    "You are currently offline. Please check your internet connection.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-black p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <svg
            className="w-24 h-24 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400">
          Looks like you've lost your internet connection. Don't worry, we'll
          automatically reconnect you when you're back online.
        </p>

        {/* Features available offline */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-left">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            What you can still do:
          </h2>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>✓ View previously loaded content</li>
            <li>✓ Browse cached pages</li>
            <li>✓ Access your profile</li>
          </ul>
        </div>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
