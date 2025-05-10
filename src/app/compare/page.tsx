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
}

interface Law {
  title: string;
  role: string;
  summary: string;
  status?: string;
  sources: { name: string; url: string }[];
}

interface Background {
  educationalBackground: string;
  professionalExperience: string;
  governmentPositionsHeld: string;
  notableAccomplishments: string;
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

  useEffect(() => {
    if (selectedA && selectedB) {
      setLoading(true);
      // Fetch comparison data
      const fetchComparison = async () => {
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
      fetchComparison();
    }
  }, [selectedA, selectedB]);

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
            <span className="text-black font-semibold">Loading comparison...</span>
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        {[0, 1].map((idx) => (
          <div key={idx} className="flex flex-col items-center w-full md:w-1/2 relative">
            <div className="text-xs mt-2">Select a candidate</div>
            <div className="w-full max-w-[300px] relative">
              <select
                className="mb-2 p-2 border rounded w-full relative z-10"
                value={idx === 0 ? selectedA : selectedB}
                onChange={e => idx === 0 ? setSelectedA(e.target.value) : setSelectedB(e.target.value)}
              >
                <option value="">Select Candidate {idx === 0 ? 'A' : 'B'}</option>
                {candidateOptions.map(opt => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
              </select>
            </div>
            <Image 
              src={candidateOptions.find(opt => opt.name === (idx === 0 ? selectedA : selectedB))?.image || "/static/images/candidate_avatar.png"} 
              width={100} 
              height={100} 
              alt={candidates[idx]?.fullName || `Candidate ${idx === 0 ? 'A' : 'B'}`} 
              className="rounded-full" 
            />
            <div className="mt-2 text-center">
              <div className="font-bold">{candidates[idx]?.fullName}</div>
              <div className="bg-[#0A4990] text-white rounded-lg px-4 py-2 mt-2 inline-block">{candidates[idx]?.party}</div>
            </div>
          </div>
        ))}
      </div>
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
          Stances
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "laws" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("laws")}
        >
          Laws
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "policy" ? "text-yellow-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab("policy")}
        >
          Policy Focus
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
              </div>
            )}
            {activeTab === "stances" && candidates[idx]?.stances && candidates[idx].stances.map((stance, i) => (
              <div key={i} className="bg-white shadow-md rounded p-4 mb-4">
                <h3 className="font-bold text-black">{stance.issue}</h3>
                <p className="text-black"><strong>Position:</strong> {stance.position}</p>
                <p className="text-black"><strong>Justification:</strong> {stance.justification}</p>
                <div className="flex flex-wrap mt-2">
                  {stance.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      className="bg-gray-200 text-blue-500 rounded-full px-3 py-1 m-1 inline-block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {activeTab === "laws" && candidates[idx]?.laws && candidates[idx].laws.length === 0 && (
              <div className="bg-white shadow-md rounded p-4 mb-4 text-center text-gray-500">
                No co-authored law
              </div>
            )}
            {activeTab === "laws" && candidates[idx]?.laws && candidates[idx].laws.map((law, i) => (
              <div key={i} className="bg-white shadow-md rounded p-4 mb-4">
                <h3 className="font-bold text-black">{law.title}</h3>
                <p className="text-black"><strong>Role:</strong> {law.role}</p>
                <p className="text-black"><strong>Summary:</strong> {law.summary}</p>
                {law.status && <p className="text-black"><strong>Status:</strong> {law.status}</p>}
                <div className="flex flex-wrap mt-2">
                  {law.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      className="bg-gray-200 text-blue-500 rounded-full px-3 py-1 m-1 inline-block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {activeTab === "policy" && candidates[idx]?.policyFocus && (
              <div className="bg-white shadow-md rounded p-4 mb-4">
                <ul className="list-disc pl-5">
                  {candidates[idx].policyFocus.map((policy, i) => (
                    <li key={i} className="text-black">{policy}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 