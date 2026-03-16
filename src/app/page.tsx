"use client";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="rounded-xl border border-purple-200 bg-white/80 px-8 py-6 shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">🚀 Welcome to your Next.js + Tailwind Starter!</h1>
        <p className="text-lg text-gray-700">
          Edit <code className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">src/app/page.tsx</code> to get started.
        </p>
        <p className="mt-4 text-sm text-gray-500">Save to see your changes live!</p>
      </div>
    </main>
  );
};

export default Home;