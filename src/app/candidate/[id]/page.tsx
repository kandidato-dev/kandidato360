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
  numberOfLawsAndBillsAuthored?: number;
  senatorBioLink: string;
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
          numberOfLawsAndBillsAuthored: background.numberOfLawsAndBillsAuthored,
          senatorBioLink: data.senatorBioLink,
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
      <div className="flex flex-col justify-center items-center min-h-[300px]">
        <GoogleAd />
        <div className="mt-4 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <span className="text-gray-600 text-sm">Loading candidate details...</span>
        </div>
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
                    key={`${idx}-source`}
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${stance.issue} ${candidateData.name} senate philippines`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Source
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
                      key={`${idx}-source`}
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        `${law.title} ${candidateData.name} senate philippines`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Source
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
          <div className="text-gray-600 text-sm mb-2">
            <span className="font-semibold">Party:</span> {candidateData.partyList}
            {candidateData.senatorBioLink && (
              <div>
                <Link
                  href={candidateData.senatorBioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline ml-2"
                >
                  View Senate Bio
                </Link>
              </div>
            )}
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
          <p className="text-gray-600">
            <strong>Number of Laws and Bills Authored:</strong> {candidateData.numberOfLawsAndBillsAuthored ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <a
          href="https://www.gmanetwork.com/news/eleksyon/2025/candidates/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span>View more about the candidate</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
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
          Stances on Social Issues
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'laws' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('laws')}
        >
          Laws and Bills
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'policy' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('policy')}
        >
          Policy Focus Area
        </button>
      </div>
      <div className="mt-4">
        {renderContent()}
      </div>
      <div className="mt-12 text-center text-xs text-gray-400">
        <span>
        Disclaimer: The information on this page is generated by AI (OpenAI GPT-4o). The developer does not have control over the data that will be displayed in the result. The information may not be 100% accurate or up-to-date. Please verify details from official and reputable sources.
        </span>
      </div>
    </div>
  );
};

export default CandidateDetails; 