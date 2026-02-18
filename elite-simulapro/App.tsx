
import React, { useState, useCallback } from 'react';
import { QuizSettings, QuizQuestion, UserAnswer, StudyPlanSettings, StudyPlan } from './types';
import { generateQuiz, generateStudyPlan } from './services/geminiService';
import { saveQuizResult } from './utils/statistics';
import HomeScreen from './components/HomeScreen';
import ConfigurationScreen from './components/ConfigurationScreen';
import StudyPlanConfigurationScreen from './components/StudyPlanConfigurationScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import StudyPlanScreen from './components/StudyPlanScreen';
import StatisticsScreen from './components/StatisticsScreen';
import Banner from './components/Banner';
import { BrainCircuitIcon } from './components/Icons';

type AppState = 'home' | 'configuringQuiz' | 'loadingQuiz' | 'quiz' | 'results' | 'error' | 'configuringStudyPlan' | 'loadingStudyPlan' | 'studyPlanResult' | 'statistics';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('home');
  
  // Quiz state
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  
  // Study Plan state
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  
  // Common state
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = useCallback(async (settings: QuizSettings) => {
    setAppState('loadingQuiz');
    setError(null);
    setQuizSettings(settings);
    try {
      const questions = await generateQuiz(settings);
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
        setUserAnswers([]);
        setAppState('quiz');
      } else {
        throw new Error("A IA não conseguiu gerar o simulado. Tente novamente com um tema diferente.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMessage);
      setAppState('error');
    }
  }, []);

  const handleGenerateStudyPlan = useCallback(async (settings: StudyPlanSettings) => {
    setAppState('loadingStudyPlan');
    setError(null);
    try {
      const plan = await generateStudyPlan(settings);
      if (plan && plan.weeklyPlan.length > 0) {
        setStudyPlan(plan);
        setAppState('studyPlanResult');
      } else {
        throw new Error("A IA não conseguiu gerar o plano de estudos. Tente novamente com parâmetros diferentes.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMessage);
      setAppState('error');
    }
  }, []);

  const handleQuizComplete = useCallback((answers: UserAnswer[]) => {
    if (quizSettings && quizQuestions.length > 0) {
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        saveQuizResult({
            subject: quizSettings.subject,
            totalQuestions: quizQuestions.length,
            correctAnswers: correctAnswers,
            timestamp: Date.now()
        });
    }
    setUserAnswers(answers);
    setAppState('results');
  }, [quizSettings, quizQuestions]);

  const handleRestartQuiz = useCallback(() => {
    if (quizSettings) {
      handleStartQuiz(quizSettings);
    }
  }, [quizSettings, handleStartQuiz]);
  
  const handleGoHome = useCallback(() => {
    setQuizSettings(null);
    setQuizQuestions([]);
    setUserAnswers([]);
    setStudyPlan(null);
    setError(null);
    setAppState('home');
  }, []);
  
  const handleNewStudyPlan = useCallback(() => {
      setStudyPlan(null);
      setAppState('configuringStudyPlan');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'home':
        return <HomeScreen onNavigate={(destination) => setAppState(destination)} />;
      
      case 'configuringQuiz':
        return <ConfigurationScreen onStartQuiz={handleStartQuiz} onBack={handleGoHome} />;

      case 'loadingQuiz':
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center relative z-10">
            <BrainCircuitIcon className="w-24 h-24 text-accent animate-pulse" />
            <h2 className="mt-4 text-2xl font-bold">Gerando seu simulado...</h2>
            <p className="mt-2 text-gray-400">Aguarde, a inteligência artificial está preparando suas questões.</p>
          </div>
        );

      case 'quiz':
        return <QuizScreen questions={quizQuestions} onQuizComplete={handleQuizComplete} settings={quizSettings!} onGoHome={handleGoHome} />;
      
      case 'results':
        return <ResultsScreen questions={quizQuestions} userAnswers={userAnswers} onRestart={handleRestartQuiz} onGoHome={handleGoHome} />;
      
      case 'configuringStudyPlan':
          return <StudyPlanConfigurationScreen onGeneratePlan={handleGenerateStudyPlan} onBack={handleGoHome} />;
      
      case 'loadingStudyPlan':
          return (
              <div className="flex flex-col items-center justify-center h-screen text-center relative z-10">
                <BrainCircuitIcon className="w-24 h-24 text-accent animate-pulse" />
                <h2 className="mt-4 text-2xl font-bold">Criando seu plano de estudos...</h2>
                <p className="mt-2 text-gray-400">Aguarde, a inteligência artificial está montando seu cronograma.</p>
              </div>
          );

      case 'studyPlanResult':
          return <StudyPlanScreen plan={studyPlan!} onNewPlan={handleNewStudyPlan} onGoToQuiz={() => setAppState('configuringQuiz')} />;

      case 'statistics':
          return <StatisticsScreen onBack={handleGoHome} />;

      case 'error':
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4 relative z-10">
                <h2 className="text-2xl font-bold text-red-500">Ocorreu um Erro</h2>
                <p className="mt-2 text-gray-300 max-w-md">{error}</p>
                <button onClick={handleGoHome} className="mt-6 bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                    Voltar ao Início
                </button>
            </div>
        );

      default:
        return <HomeScreen onNavigate={(destination) => setAppState(destination)} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-dark font-sans relative overflow-x-hidden flex flex-col">
      {/* Background Layer with Remote Image for reliable testing */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80" 
          alt="SimulaPro Assistant" 
          className="absolute right-[-10%] bottom-[-5%] h-[90vh] md:h-[110vh] w-auto object-contain opacity-10 md:opacity-20 mix-blend-screen filter grayscale contrast-125"
          onLoad={(e) => (e.currentTarget.style.opacity = '0.2')}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-dark via-neutral-dark/90 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col">
        <Banner />
        <main className="container mx-auto p-4 flex-grow">
          {renderContent()}
        </main>
        
        {/* Institutional Footer */}
        <footer className="py-8 text-center text-gray-500 text-sm mt-12 border-t border-white/5 bg-neutral-dark/60 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <p className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="font-medium">Todos os direitos reservados &copy; {new Date().getFullYear()}</span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <a 
                href="https://www.apostilasdeelite.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-accent transition-all underline decoration-accent/30 underline-offset-4 font-semibold hover:decoration-accent"
              >
                Site Apostilas de Elite
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
