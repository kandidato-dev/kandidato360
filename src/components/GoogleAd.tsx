'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAd() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT;
  const isTestMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === 'true';

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
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-adtest={isTestMode ? 'on' : 'off'}
      />
    </div>
  );
} 