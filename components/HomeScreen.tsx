
import React, { useState, useEffect } from 'react';
import { BrainCircuitIcon, CalendarCheckIcon, BarChartIcon } from './Icons';

interface HomeScreenProps {
  onNavigate: (destination: 'configuringQuiz' | 'configuringStudyPlan' | 'statistics') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Impede o Chrome de mostrar o banner automático
      e.preventDefault();
      // Guarda o evento para disparar depois
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
      console.log('App instalado com sucesso!');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário respondeu à instalação: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <div className="min-h-[calc(100-screen-64px)] flex items-center justify-center">
      <div className="text-center w-full max-w-lg p-8 rounded-3xl bg-neutral-dark/40 backdrop-blur-sm border border-white/5">
        <BrainCircuitIcon className="mx-auto w-20 h-20 text-accent drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white drop-shadow-md">Elite SimulaPro</h1>
        <p className="mt-3 mb-8 text-xl text-gray-300 font-medium">Seu assistente de elite para concursos</p>
        
        <div className="space-y-4">
          <button
            onClick={() => onNavigate('configuringQuiz')}
            className="w-full flex items-center justify-center gap-4 py-5 px-6 font-bold text-white bg-primary/90 rounded-xl hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-neutral-dark transition-all transform hover:scale-[1.02] shadow-xl"
          >
            <BrainCircuitIcon className="w-6 h-6" />
            <span className="text-lg">Gerar Simulado com IA</span>
          </button>
          
          <button
            onClick={() => onNavigate('configuringStudyPlan')}
            className="w-full flex items-center justify-center gap-4 py-5 px-6 font-bold text-white bg-neutral-light/80 backdrop-blur-md rounded-xl hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-neutral-dark transition-all transform hover:scale-[1.02] border border-white/10 shadow-lg"
          >
            <CalendarCheckIcon className="w-6 h-6" />
            <span className="text-lg">Plano de Estudos Inteligente</span>
          </button>

          <button
            onClick={() => onNavigate('statistics')}
            className="w-full flex items-center justify-center gap-4 py-5 px-6 font-bold text-white bg-neutral-light/80 backdrop-blur-md rounded-xl hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-neutral-dark transition-all transform hover:scale-[1.02] border border-white/10 shadow-lg"
          >
            <BarChartIcon className="w-6 h-6" />
            <span className="text-lg">Estatísticas de Desempenho</span>
          </button>

          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-4 py-3 px-6 font-bold text-accent bg-accent/10 border border-accent/30 rounded-xl hover:bg-accent/20 transition-all mt-4 animate-bounce"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Instalar Aplicativo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
