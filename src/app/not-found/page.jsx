import React from "react";

export const metadata = {
  title: "404 Not Found",
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

const NotFound = () => {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-2xl font-semibold text-indigo-600">404</p>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
          Page not found
        </p>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-7 flex items-center justify-center gap-x-6">
          <a
            href="/dashboard"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
