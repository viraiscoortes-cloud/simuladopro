
import React, { useState, useRef } from 'react';
import { QuizQuestion, UserAnswer, QuizSettings } from '../types';
import { ExternalLinkIcon, HomeIcon, SpeakerWaveIcon } from './Icons';
import { generateSpeech } from '../services/geminiService';

interface QuizScreenProps {
  questions: QuizQuestion[];
  settings: QuizSettings;
  onQuizComplete: (answers: UserAnswer[]) => void;
  onGoHome: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, settings, onQuizComplete, onGoHome }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null); // 'question' | 'explanation' | null
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  
  const currentAnswerRecord = userAnswers.find(a => a.questionIndex === currentQuestionIndex);
  const isAnswered = !!currentAnswerRecord;
  const selectedAnswerIndex = currentAnswerRecord?.selectedAnswerIndex ?? null;

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const playTTS = async (text: string, type: 'question' | 'explanation') => {
    if (isSpeaking) return;
    
    setIsSpeaking(type);
    try {
      const base64Audio = await generateSpeech(text);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(null);
      source.start();
    } catch (error) {
      console.error("Erro ao reproduzir TTS:", error);
      setIsSpeaking(null);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    const newAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswerIndex: index,
      isCorrect: isCorrect,
    };

    setUserAnswers((prev) => [...prev, newAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onQuizComplete(userAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-neutral-light hover:bg-neutral border border-transparent';
    }
    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-700/80 border border-green-500 ring-2 ring-green-500/20';
    }
    if (index === selectedAnswerIndex) {
      return 'bg-red-700/80 border border-red-500';
    }
    return 'bg-neutral-light opacity-60 border border-transparent';
  };
  
  const wasAnswerCorrect = currentAnswerRecord?.isCorrect;

  const fullQuestionText = `${currentQuestion.question}. Alternativas: ${currentQuestion.options.map((opt, i) => `${String.fromCharCode(65+i)}: ${opt}`).join(". ")}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Info Card */}
      <div className="bg-neutral-light/60 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-6 border border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-gray-300 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Questão {currentQuestionIndex + 1} de {questions.length}</span>
            <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-md text-xs font-bold border border-accent/30 uppercase tracking-wider">
              Banca: {currentQuestion.banca}
            </span>
          </div>
           <button onClick={onGoHome} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-white/5">
             <HomeIcon className="w-4 h-4" />
             <span className="font-semibold">Sair</span>
           </button>
        </div>
        <div className="w-full bg-neutral-dark/50 mt-4 rounded-full h-1.5 overflow-hidden">
          <div className="bg-accent h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-neutral-light/40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 relative">
        <div className="flex justify-between items-start gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold leading-relaxed text-white flex-1">{currentQuestion.question}</h2>
          <button 
            onClick={() => playTTS(fullQuestionText, 'question')}
            disabled={isSpeaking !== null}
            title="Ouvir questão e alternativas"
            className={`p-3 rounded-full transition-all ${isSpeaking === 'question' ? 'bg-accent text-white animate-pulse' : 'bg-neutral-dark/40 text-accent hover:bg-accent/20'}`}
          >
            <SpeakerWaveIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-start group relative overflow-hidden ${getButtonClass(index)}`}
            >
              <span className="font-bold mr-4 text-accent group-hover:scale-110 transition-transform">{String.fromCharCode(65 + index)}.</span>
              <span className="flex-1">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Area */}
      {isAnswered && (
        <div className="mt-6 p-6 bg-neutral-dark/60 backdrop-blur-sm rounded-3xl border border-white/5 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-accent flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent rounded-full inline-block"></span>
                Fundamentação
              </h3>
              <button 
                onClick={() => playTTS(currentQuestion.explanation, 'explanation')}
                disabled={isSpeaking !== null}
                title="Ouvir fundamentação"
                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${isSpeaking === 'explanation' ? 'bg-accent text-white animate-pulse' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
              >
                <SpeakerWaveIcon className="w-4 h-4" />
                <span>Ouvir</span>
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">{currentQuestion.explanation}</p>
            {wasAnswerCorrect && (
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(settings.subject + " " + currentQuestion.banca + " " + currentQuestion.question)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-white transition-colors py-2 px-4 rounded-xl bg-accent/10 border border-accent/20"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Aprofundar no Google
              </a>
            )}
        </div>
      )}
      
      {/* Navigation Controls */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`w-full sm:w-auto py-4 px-8 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border ${
            currentQuestionIndex === 0 
            ? 'opacity-0 pointer-events-none' 
            : 'bg-neutral-light/50 text-gray-300 border-white/10 hover:bg-neutral-light hover:text-white'
          }`}
        >
          <span>← Voltar para anterior</span>
        </button>

        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto py-4 px-12 font-bold text-white bg-primary rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{currentQuestionIndex < questions.length - 1 ? 'Próxima Questão →' : 'Finalizar Simulado'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizScreen;
