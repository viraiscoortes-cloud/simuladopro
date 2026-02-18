import React, { useState, useEffect, useMemo } from 'react';
import { QuizResult } from '../types';
import { getQuizResults, clearQuizResults } from '../utils/statistics';
import { BarChartIcon } from './Icons';

interface StatisticsScreenProps {
  onBack: () => void;
}

interface SubjectStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

// FIX: Added OverallStats interface to strongly type the return value of useMemo,
// ensuring correct type inference for stats.subjectStats and resolving errors in the render logic.
interface OverallStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  subjectStats: Record<string, SubjectStats>;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onBack }) => {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setResults(getQuizResults());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza de que deseja apagar todo o seu histórico de simulados? Esta ação não pode ser desfeita.')) {
      clearQuizResults();
      setResults([]);
    }
  };

  const stats = useMemo((): OverallStats | null => {
    if (results.length === 0) {
      return null;
    }

    const totalQuizzes = results.length;
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    const subjectStatsMap = new Map<string, { total: number; correct: number }>();
    for (const result of results) {
      const current = subjectStatsMap.get(result.subject) || { total: 0, correct: 0 };
      current.total += result.totalQuestions;
      current.correct += result.correctAnswers;
      subjectStatsMap.set(result.subject, current);
    }

    const subjectStats: Record<string, SubjectStats> = {};
    subjectStatsMap.forEach((value, key) => {
      subjectStats[key] = {
        totalQuestions: value.total,
        correctAnswers: value.correct,
        accuracy: (value.correct / value.total) * 100,
      };
    });

    return { totalQuizzes, totalQuestions, totalCorrect, overallAccuracy, subjectStats };
  }, [results]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <BarChartIcon className="mx-auto w-16 h-16 text-accent" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Estatísticas de Desempenho</h1>
        <p className="mt-2 text-gray-400">Acompanhe seu progresso nos simulados.</p>
      </div>

      {!stats ? (
        <div className="bg-neutral-light text-center p-8 rounded-2xl shadow-2xl">
          <p className="text-gray-300">Nenhuma estatística encontrada. Complete um simulado para começar!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-neutral-light p-6 rounded-2xl text-center">
              <p className="text-4xl font-bold text-accent">{stats.totalQuizzes}</p>
              <p className="text-gray-400">Simulados Feitos</p>
            </div>
            <div className="bg-neutral-light p-6 rounded-2xl text-center">
              <p className="text-4xl font-bold text-accent">{stats.totalQuestions}</p>
              <p className="text-gray-400">Questões Respondidas</p>
            </div>
            <div className="bg-neutral-light p-6 rounded-2xl text-center">
              <p className="text-4xl font-bold text-accent">{stats.overallAccuracy.toFixed(1)}%</p>
              <p className="text-gray-400">Precisão Geral</p>
            </div>
          </div>

          <div className="bg-neutral-light p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Desempenho por Matéria</h2>
            <div className="space-y-4">
              {/* FIX: Cast Object.entries to the correct type to allow sorting and mapping without type errors. */}
              {(Object.entries(stats.subjectStats) as [string, SubjectStats][]).sort(([, a], [, b]) => a.accuracy - b.accuracy).map(([subject, data]) => (
                <div key={subject}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{subject}</span>
                        <span className="text-sm font-mono text-gray-300">{data.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-neutral rounded-full h-4">
                        <div className="bg-accent h-4 rounded-full" style={{ width: `${data.accuracy}%` }}></div>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">{data.correctAnswers} / {data.totalQuestions} corretas</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={onBack} className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-primary rounded-lg hover:bg-secondary transition-colors">
          Voltar ao Início
        </button>
        {stats && (
           <button onClick={handleClearHistory} className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-red-700 hover:bg-red-800 transition-colors">
             Limpar Histórico
           </button>
        )}
      </div>
    </div>
  );
};

export default StatisticsScreen;