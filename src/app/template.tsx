'use client';

import Script from 'next/script';

export default function Template({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isTestMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === 'true';

  return (
    <>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}${isTestMode ? '&adsense_test=true' : ''}`}
      />
      {children}
    </>
  );
} 