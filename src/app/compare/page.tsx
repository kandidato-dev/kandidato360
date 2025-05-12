"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ErrorDialog from '@/components/ErrorDialog';

interface Stance {
  issue: string;
  position: string;
  justification: string;
  sources: { name: string; url: string }[];
  source: string;
}

interface Law {
  title: string;
  role: string;
  summary: string;
  description: string;
  status?: string;
  sources: { name: string; url: string }[];
  source: string;
  justification: string;
}

interface Background {
  educationalBackground: string;
  professionalExperience: string;
  governmentPositionsHeld: string;
  notableAccomplishments: string;
  numberOfLawsAndBillsAuthored?: number;
}

interface Candidate {
  id: string;
  fullName: string;
  party: string;
  background: Background;
  stances: Stance[];
  laws: Law[];
  policyFocus: string[];
}

interface CandidateOption {
  id: string;
  name: string;
  party: string;
  image: string;
}

export default function ComparePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState("stances");
  const [candidateOptions, setCandidateOptions] = useState<CandidateOption[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch candidate list for dropdowns
    const fetchCandidates = async () => {
      try {
        const res = await fetch("/api/candidates");
        const data = await res.json();
        setCandidateOptions(data);
      } catch (err) {
        console.error('Failed to load candidates:', err);
        setError('Failed to load candidates. Please try again later.');
        setIsErrorDialogOpen(true);
      }
    };
    fetchCandidates();
  }, []);

  // Add this function to handle candidate selection
  const handleCandidateSelect = (value: string, isCandidateA: boolean) => {
    if (isCandidateA) {
      setSelectedA(value);
      if (value === selectedB) {
        setError('You selected the same candidate. Please select a different candidate.');
        setIsErrorDialogOpen(true);
      }
    } else {
      setSelectedB(value);
      if (value === selectedA) {
        setError('You selected the same candidate. Please select a different candidate.');
        setIsErrorDialogOpen(true);
      }
    }
  };

  // Add this function to trigger comparison only on button click
  const handleCompare = async () => {
    if (!selectedA || !selectedB) return;
    setLoading(true);
    try {
      const res = await fetch("/api/compareCandidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateA: selectedA, candidateB: selectedB }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch comparison data');
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch comparison:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch response from OpenAI';
      setError(errorMessage);
      setIsErrorDialogOpen(true);
      setCandidates([]); // Clear candidates on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        message={error || 'An unexpected error occurred'}
      />

      <div className="flex items-center mb-4">
        <Link href="/">
          <button className="mr-2 p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </Link>
        <div className="flex items-center">
          <Image
            src="/static/svg/compare-symbol.svg"
            alt="Compare"
            width={24}
            height={24}
            className="mr-2"
          />
          <h1 className="text-2xl font-bold">Compare Candidate</h1>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <div className="loader mb-2" style={{ borderTopColor: '#0A4990', borderWidth: 4, width: 40, height: 40, borderRadius: '50%', borderStyle: 'solid', borderColor: '#e5e7eb #e5e7eb #0A4990 #e5e7eb', animation: 'spin 1s linear infinite' }} />
            <span className="text-black font-semibold">AI is now comparing candidates and fetching data...</span>
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* --- Horizontally Aligned Candidate Cards --- */}
      <div className="flex flex-row justify-center items-center gap-2 md:gap-8 mb-8">
        {/* First candidate */}
        <div className="flex flex-col items-center w-1/2 md:w-1/3 max-w-[150px] md:max-w-xs mx-auto">
          <div className="text-xs mt-2 mb-2">Select a candidate</div>
          <div className="w-full max-w-[120px] md:max-w-[300px] mb-2 md:mb-4">
            <select
              className="p-1 md:p-2 border rounded w-full text-xs md:text-base"
              value={selectedA}
              onChange={e => handleCandidateSelect(e.target.value, true)}
            >
              <option value="">Select A</option>
              {candidateOptions.map(opt => (
                <option key={opt.id} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div className="w-[60px] h-[60px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
            <Image
              src={candidateOptions.find(opt => opt.name === selectedA)?.image || "/static/images/candidate_avatar.png"}
              width={120}
              height={120}
              alt={candidates[0]?.fullName || 'Candidate A'}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-1 md:mt-2 text-center min-h-[1.5rem] md:min-h-[2.5rem] flex items-center justify-center">
            <div className="font-bold text-xs md:text-base">{candidates[0]?.fullName || <span>&nbsp;</span>}</div>
          </div>
          <div className="bg-[#0A4990] text-white rounded-lg px-2 md:px-4 py-1 md:py-2 mt-1 md:mt-2 inline-block min-h-[1.5rem] md:min-h-[2.5rem] flex items-center justify-center text-xs md:text-base">
            {candidates[0]?.party || <span>&nbsp;</span>}
          </div>
        </div>

        {/* VS text in the middle */}
        <div className="flex items-center justify-center text-lg md:text-2xl font-bold text-gray-500">
          VS
        </div>

        {/* Second candidate */}
        <div className="flex flex-col items-center w-1/2 md:w-1/3 max-w-[150px] md:max-w-xs mx-auto">
          <div className="text-xs mt-2 mb-2">Select a candidate</div>
          <div className="w-full max-w-[120px] md:max-w-[300px] mb-2 md:mb-4">
            <select
              className="p-1 md:p-2 border rounded w-full text-xs md:text-base"
              value={selectedB}
              onChange={e => handleCandidateSelect(e.target.value, false)}
            >
              <option value="">Select B</option>
              {candidateOptions.map(opt => (
                <option key={opt.id} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div className="w-[60px] h-[60px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
            <Image
              src={candidateOptions.find(opt => opt.name === selectedB)?.image || "/static/images/candidate_avatar.png"}
              width={120}
              height={120}
              alt={candidates[1]?.fullName || 'Candidate B'}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-1 md:mt-2 text-center min-h-[1.5rem] md:min-h-[2.5rem] flex items-center justify-center">
            <div className="font-bold text-xs md:text-base">{candidates[1]?.fullName || <span>&nbsp;</span>}</div>
          </div>
          <div className="bg-[#0A4990] text-white rounded-lg px-2 md:px-4 py-1 md:py-2 mt-1 md:mt-2 inline-block min-h-[1.5rem] md:min-h-[2.5rem] flex items-center justify-center text-xs md:text-base">
            {candidates[1]?.party || <span>&nbsp;</span>}
          </div>
        </div>
      </div>
      {/* --- End Horizontally Aligned Candidate Cards --- */}

      {/* --- Compare Button Below Candidates --- */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleCompare}
          disabled={loading || !selectedA || !selectedB}
          className={`w-32 md:w-64 bg-blue-700 text-white font-bold rounded-md px-4 md:px-8 py-2 md:py-4 text-sm md:text-xl shadow ${
            loading || !selectedA || !selectedB ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
          }`}
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>
      {/* --- End Compare Button --- */}

      <div className="flex border-b border-gray-300 mb-4">
        <button
          className={`px-4 py-2 ${activeTab === "background" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("background")}
        >
          Background
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "stances" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("stances")}
        >
           Stances on Social Issues
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "laws" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("laws")}
        >
          Laws and Bills
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "policy" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("policy")}
        >
          Policy Focus Area
        </button>
      </div>
      <div className="flex gap-4">
        {[0, 1].map((idx) => (
          <div key={idx} className="w-1/2">
            {activeTab === "background" && candidates[idx] && (
              <div className="bg-white shadow-md rounded p-4 mb-4">
                <p className="text-black"><strong>Educational Background:</strong> {candidates[idx].background.educationalBackground}</p>
                <p className="text-black"><strong>Professional Experience:</strong> {candidates[idx].background.professionalExperience}</p>
                <p className="text-black"><strong>Government Positions Held:</strong> {candidates[idx].background.governmentPositionsHeld}</p>
                <p className="text-black"><strong>Notable Accomplishments:</strong> {candidates[idx].background.notableAccomplishments}</p>
                <p className="text-black"><strong>Number of Laws and Bills Authored:</strong> {candidates[idx].background.numberOfLawsAndBillsAuthored ?? 'N/A'}</p>
              </div>
            )}
            {activeTab === "stances" && candidates[idx]?.stances && candidates[idx].stances.map((stance, i) => (
              <div key={i} className="bg-white shadow-md rounded p-4 mb-4">
                <h4 className="font-semibold text-gray-800">{stance.issue}</h4>
                <p className="text-gray-600">{stance.position}</p>
                {stance.justification && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Justification:</span> {stance.justification}
                  </p>
                )}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    `${stance.issue} ${candidates[idx].fullName} senate philippines`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Source
                </a>
              </div>
            ))}
            {activeTab === "laws" && candidates[idx]?.laws && candidates[idx].laws.length === 0 && (
              <div className="bg-white shadow-md rounded p-4 mb-4 text-center text-gray-500">
                No co-authored law
              </div>
            )}
            {activeTab === "laws" && candidates[idx]?.laws && candidates[idx].laws.map((law, i) => (
              <div key={i} className="bg-white shadow-md rounded p-4 mb-4">
                <h4 className="font-semibold text-gray-800">{law.title}</h4>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Law/Bill Title:</span> {law.title}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Role:</span> {law.role}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Description:</span>{" "}
                  {law.summary && law.summary.trim() !== ""
                    ? law.summary
                    : law.description && law.description.trim() !== ""
                      ? law.description
                      : <span className="italic text-gray-400">Source not found</span>}
                </p>
                {law.status && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Status:</span> {law.status}
                  </p>
                )}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    `${law.title} ${candidates[idx].fullName} senate philippines`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Source
                </a>
              </div>
            ))}
            {activeTab === "policy" && (
              <div className="bg-white shadow-md rounded p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-4">Policy Focus Areas</h4>
                {candidates[idx]?.policyFocus && candidates[idx].policyFocus.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {candidates[idx].policyFocus.map((policy, i) => (
                      <li key={i} className="text-gray-600">{policy}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No policy focus areas available</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}