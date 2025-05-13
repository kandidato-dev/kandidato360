"use client";

import Image from "next/image";
import Link from "next/link";

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <Image
            src="/static/svg/compare-symbol.svg"
            alt="Compare"
            width={64}
            height={64}
            className="mx-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Feature Temporarily Unavailable
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The candidate comparison feature has been disabled until the next election period. 
          We appreciate your understanding.
        </p>
        <Link href="/">
          <button className="bg-blue-700 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-800 transition-colors">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
}