import Image from "next/image";
import Link from "next/link";

export default function DonatePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Support this app and buy me a coffee</h1>
        <p className="mb-6 text-gray-600">
          If you find this app helpful, consider supporting its development!
        </p>
        <a
          href="https://buymeacoffee.com/benjoe22d"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg shadow transition mb-6"
        >
          ☕ Buy Me a Coffee
        </a>
        <div className="my-6">
          <Image
            src="/static/images/bj-gqr.jpg"
            alt="InstaPay QR Code"
            width={300}
            height={300}
            className="mx-auto rounded"
            priority
          />
          <div className="mt-4 text-gray-700 text-sm">
            <div>Transfer fees may apply.</div>
            <div className="font-bold text-blue-700 text-lg mt-2">BE***E V.</div>
            <div className="text-gray-500">Mobile No.: 099• ••••774</div>
            <div className="text-gray-500">User ID: •••••••••WE1AJI</div>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 