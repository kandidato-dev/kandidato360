// pages/index.tsx - Senatorial Candidates List Page
'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  image: string;
}

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/candidates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setCandidates(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load candidates:', err);
        setError('Failed to load candidates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(search.toLowerCase()) ||
    candidate.party.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 pb-24 min-h-screen bg-white relative">
      <h1 className="text-xl font-bold text-gray-700">Senatorial Candidates</h1>
      <h2 className="text-4xl font-extrabold mb-6">2025</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search candidates..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#222222]"
      />

      {loading && <p className="text-gray-500">Loading candidates...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && filteredCandidates.length === 0 && (
        <p className="text-gray-500">No candidates found.</p>
      )}

      <div className="px-4">
        {filteredCandidates.map((candidate) => (
          <Link key={candidate.id} href={`/candidate/${candidate.id}?image=${encodeURIComponent(candidate.image)}`}>
            <div className="relative mb-6">
              <div className="flex items-center bg-yellow-400 rounded-xl p-4 cursor-pointer shadow-md hover:opacity-90 transition">
                <Image
                  src={candidate.image || '/static/images/candidate_avatar.png'}
                  width={80}
                  height={80}
                  alt={candidate.name}
                  className="rounded-full border-4 border-white object-cover aspect-square"
                />
                <div className="ml-4">
                  <p className="font-bold text-black text-lg">{candidate.name}</p>
                  <span className="bg-blue-800 text-white px-3 py-1 rounded-full text-sm">
                    {candidate.party}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Compare Candidate Button */}
      <Link href="/compare">
        <button className="fixed left-0 right-0 bottom-16 w-full bg-[#0A4990] text-white flex items-center justify-center gap-2 py-4 font-semibold text-lg shadow-lg z-40 rounded-none">
          <Image
            src="/static/svg/compare-symbol.svg"
            alt="Compare"
            width={24}
            height={24}
            className="text-white"
          />
          Compare Candidate
        </button>
      </Link>

      <div className="fixed bottom-0 left-0 w-full bg-blue-900 text-white flex justify-around py-3 border-t border-blue-800">
        <Link href="/">
          <button className="flex flex-col items-center text-xs">
            <span className="text-xl">📋</span>
            Candidates
          </button>
        </Link>
      
        <Link href="/donate">
          <button className="flex flex-col items-center text-xs">
            <span className="text-xl">📰</span>
            Support
          </button>
        </Link>
      </div>
    </div>
  );
}
