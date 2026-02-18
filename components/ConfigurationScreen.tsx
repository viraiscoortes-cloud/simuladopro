
import React, { useState } from 'react';
import { QuizSettings } from '../types';
import { BrainCircuitIcon } from './Icons';

interface ConfigurationScreenProps {
  onStartQuiz: (settings: QuizSettings) => void;
  onBack: () => void;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onStartQuiz, onBack }) => {
  const [subject, setSubject] = useState('Direito Constitucional');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuizSettings['difficulty']>('Médio');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({ subject, numQuestions, difficulty });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg p-8 space-y-8 bg-neutral-light rounded-2xl shadow-2xl">
        <div className="text-center">
          <BrainCircuitIcon className="mx-auto w-16 h-16 text-accent" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Configurar Simulado</h1>
          <p className="mt-2 text-gray-400">Escolha os detalhes do seu simulado</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
              Matéria / Tópico
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Língua Portuguesa, Segurança da Informação"
              className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-300 mb-2">
              Número de Questões
            </label>
            <select
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dificuldade</label>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-neutral p-1">
              {(['Fácil', 'Médio', 'Difícil'] as QuizSettings['difficulty'][]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    difficulty === level ? 'bg-accent text-white' : 'bg-transparent text-gray-300 hover:bg-neutral-light'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 font-bold text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-neutral-dark transition-transform transform hover:scale-105"
            >
              Gerar Simulado
            </button>
            <button type="button" onClick={onBack} className="w-full sm:w-auto py-3 px-4 font-bold text-gray-200 bg-neutral rounded-lg hover:bg-neutral/80 transition-colors">
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationScreen;
