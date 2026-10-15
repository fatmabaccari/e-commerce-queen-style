'use client';

export default function HeroSkeleton() {
  return (
    <div className="h-screen w-full bg-white-600 animate-pulse flex items-center justify-center">
      <div className="w-3/4 max-w-4xl space-y-6">
        <div className="h-12 bg-gray-700 rounded w-2/3" />
        <div className="h-8 bg-gray-600 rounded w-full" />
        <div className="h-8 bg-gray-600 rounded w-5/6" />
        <div className="h-12 bg-yellow-400 rounded-full w-48 mt-10" />
      </div>
    </div>
  );
}
