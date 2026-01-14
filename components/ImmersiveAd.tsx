import React, { useEffect } from 'react';

interface ImmersiveAdProps {
  section: string;
}

const ImmersiveAd: React.FC<ImmersiveAdProps> = ({ section }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, [section]);

  return (
    <div className="ad-container cut-corners my-6 animate-in fade-in duration-500">
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6403370988033052"
        data-ad-slot="7050630014"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default ImmersiveAd;