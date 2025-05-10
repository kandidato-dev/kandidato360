'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAd() {
  useEffect(() => {
    try {
      // Wait for the adsbygoogle object to be available
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '100px'
        }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-9496331727688071"
        data-ad-slot="YOUR_AD_SLOT_ID" // Replace with your actual ad slot ID
      />
    </div>
  );
} 