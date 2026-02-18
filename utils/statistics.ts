import { QuizResult } from '../types';

const STATS_KEY = 'eliteSimulaProStats';

export const getQuizResults = (): QuizResult[] => {
  try {
    const resultsJson = localStorage.getItem(STATS_KEY);
    return resultsJson ? JSON.parse(resultsJson) : [];
  } catch (error) {
    console.error("Failed to parse quiz results from localStorage", error);
    return [];
  }
};

export const saveQuizResult = (result: QuizResult): void => {
  const existingResults = getQuizResults();
  const newResults = [...existingResults, result];
  localStorage.setItem(STATS_KEY, JSON.stringify(newResults));
};

export const clearQuizResults = (): void => {
  localStorage.removeItem(STATS_KEY);
};