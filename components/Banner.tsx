
import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

const BANNER_DISMISSED_KEY = 'eliteSimulaProBannerDismissed';

const Banner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-neutral-light to-neutral text-center py-3 px-4 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-white">
        🚀 <span className="font-semibold">Faça parte deste projeto!</span> Anuncie AQUI.
        <a href="mailto:apostilasdeelite@gmail.com" className="underline ml-2 hover:text-accent transition-colors">Saiba Mais</a>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Fechar anúncio"
        className="absolute top-1/2 right-4 -translate-y-1/2 p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Banner;
