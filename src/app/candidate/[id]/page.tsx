'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import GoogleAd from '@/components/GoogleAd';
import ErrorDialog from '@/components/ErrorDialog';
import Head from 'next/head';

interface Law {
  title: string;
  role: string;
  summary: string;
  sources: { name: string; url: string }[];
  status?: string;
  billNumber?: string;
}

interface Stance {
  issue: string;
  position: string;
  justification: string;
  sources: { name: string; url: string }[];
}

interface Candidate {
  name: string;
  background: string;
  stances: Stance[];
  laws: Law[];
  policy: string;
  image: string;
  partyList: string;
  educationalBackground: string;
  professionalExperience: string;
  governmentPositionsHeld: string;
  notableAccomplishments: string;
  criminalRecords: string;
}

const CandidateDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('background');
  const [candidateData, setCandidateData] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  useEffect(() => {
    if (!params || !searchParams) return;
    const fetchCandidateData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/getCandidateData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ candidateName: params.id }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch candidate data');
        }

        // Check if the expected fields exist
        if (!data.fullName || !data.background || !data.stances || !data.laws || !data.policyFocus || !data.party) {
          throw new Error('Invalid response structure: Missing required fields');
        }

        const { fullName, background, stances, laws, policyFocus, party } = data;

        setCandidateData({
          name: fullName,
          background: `${background.educationalBackground}, ${background.professionalExperience}`,
          stances: Array.isArray(stances) ? stances.map((stance: any) => ({
            issue: stance.issue,
            position: stance.position,
            justification: stance.justification,
            sources: stance.sources.map((source: any) => ({ name: source.name, url: source.url }))
          })) : [],
          laws: Array.isArray(laws) ? laws.map((law: any) => ({
            title: law.title,
            role: law.role,
            summary: law.summary,
            sources: law.sources.map((source: any) => ({ name: source.name, url: source.url })),
            status: law.status,
            billNumber: law.billNumber
          })) : [],
          policy: Array.isArray(policyFocus) ? policyFocus.join(', ') : '',
          image: searchParams.get('image') || '',
          partyList: party,
          educationalBackground: background.educationalBackground,
          professionalExperience: background.professionalExperience,
          governmentPositionsHeld: background.governmentPositionsHeld,
          notableAccomplishments: background.notableAccomplishments,
          criminalRecords: background.criminalRecords,
        });
        setError(null);
      } catch (error) {
        console.error('Failed to fetch candidate data:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        setIsErrorDialogOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [params, searchParams]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/">
            <button className="mr-2 p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Candidate Details</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="loader mb-4" style={{ borderTopColor: '#0A4990', borderWidth: 4, width: 40, height: 40, borderRadius: '50%', borderStyle: 'solid', borderColor: '#e5e7eb #e5e7eb #0A4990 #e5e7eb', animation: 'spin 1s linear infinite' }} />
          <span className="text-black font-semibold mb-8">Loading candidate data...</span>
          <div className="w-full max-w-[728px]">
            {/* <GoogleAd /> */}
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!candidateData) return <p>Loading...</p>;

  const renderContent = () => {
    switch (activeTab) {
      case 'background':
        return <div>{candidateData.background}</div>;
      case 'stances':
        return (
          <div>
            {candidateData.stances.map((stance: Stance, index: number) => (
              <div key={index} className="bg-white shadow-md rounded p-4 mb-4">
                <h3 className="font-bold text-black">{stance.issue}</h3>
                <p className="text-black"><strong>Position:</strong> {stance.position}</p>
                <p className="text-black"><strong>Justification:</strong> {stance.justification}</p>
                <div className="flex flex-wrap mt-2">
                  {stance.sources.map((source: { name: string; url: string }, idx: number) => (
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
          </div>
        );
      case 'laws':
        return (
          <div>
            {candidateData.laws.length === 0 && (
              <div className="bg-white shadow-md rounded p-4 mb-4 text-center text-gray-500">
                No co-authored law
              </div>
            )}
            {candidateData.laws.map((law: Law, index: number) => {
              let billUrl = '';
              if (law.billNumber) {
                const match = law.billNumber.match(/(SB|HB)\s*([0-9]+)/i);
                if (match) {
                  const prefix = match[1].toUpperCase();
                  const number = match[2];
                  billUrl = `https://legacy.senate.gov.ph/lis/bill_res.aspx?congress=19&q=${prefix}+${number}`;
                }
              }
              return (
                <div key={index} className="bg-white shadow-md rounded p-4 mb-4">
                  <h3 className="font-bold text-black">{law.title}</h3>
                  {law.billNumber && billUrl ? (
                    <p className="text-black">
                      <strong>Bill Number:</strong> <a href={billUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{law.billNumber}</a>
                    </p>
                  ) : law.billNumber ? (
                    <p className="text-black"><strong>Bill Number:</strong> {law.billNumber}</p>
                  ) : null}
                  <p className="text-black"><strong>Law/Bill Title:</strong> {law.title}</p>
                  <p className="text-black"><strong>Role:</strong> {law.role}</p>
                  <p className="text-black"><strong>Summary:</strong> {law.summary}</p>
                  {law.status && <p className="text-black"><strong>Status:</strong> {law.status}</p>}
                  <div className="flex flex-wrap mt-2">
                    {law.sources.map((source: { name: string; url: string }, idx: number) => (
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
              );
            })}
          </div>
        );
      case 'policy':
        return <div>{candidateData.policy}</div>;
      default:
        return null;
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
        <h1 className="text-2xl font-bold">Candidate Details</h1>
      </div>
      <div className="flex items-center mt-4">
        <Image
          src={candidateData.image}
          width={100}
          height={100}
          alt={`Image of ${candidateData.name}`}
          className="rounded-full"
        />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{candidateData.name}</h1>
          <div className="bg-[#0A4990] text-white rounded-full px-3 py-1 inline-block mt-2">
            {candidateData.partyList}
          </div>
          <p className="text-gray-600 mt-2">
            <strong>Educational Background:</strong> {candidateData.educationalBackground}
          </p>
          <p className="text-gray-600">
            <strong>Professional Experience:</strong> {candidateData.professionalExperience}
          </p>
          <p className="text-gray-600">
            <strong>Government Positions Held:</strong> {candidateData.governmentPositionsHeld}
          </p>
          <p className="text-gray-600">
            <strong>Notable Accomplishments:</strong> {candidateData.notableAccomplishments}
          </p>
          <p className="text-gray-600">
            <strong>Criminal Records:</strong> {candidateData.criminalRecords}
          </p>
        </div>
      </div>
      <div className="mt-6 border-b border-gray-300">
        <button
          className={`px-4 py-2 ${activeTab === 'background' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('background')}
        >
          Background
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'stances' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stances')}
        >
          Stances
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'laws' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('laws')}
        >
          Laws
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'policy' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('policy')}
        >
          Policy Focus
        </button>
      </div>
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default CandidateDetails; 