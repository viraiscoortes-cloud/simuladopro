
import React from 'react';
import { QuizQuestion, UserAnswer } from '../types';
import { CheckCircleIcon, XCircleIcon, BookOpenIcon } from './Icons';

interface ResultsScreenProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  onRestart: () => void;
  onGoHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ questions, userAnswers, onRestart, onGoHome }) => {
  const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
  const scorePercentage = (correctAnswersCount / questions.length) * 100;

  const getScoreColor = () => {
    if (scorePercentage >= 70) return 'text-green-500';
    if (scorePercentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-neutral-light text-center p-8 rounded-2xl shadow-2xl mb-8">
        <h1 className="text-3xl font-bold mb-2">Resultado do Simulado</h1>
        <p className="text-gray-400 mb-6">Veja seu desempenho e revise as questões.</p>
        <div className="flex justify-center items-baseline space-x-4">
            <div className='text-center'>
                <p className="text-6xl font-bold" style={{ color: getScoreColor() }}>{scorePercentage.toFixed(0)}%</p>
                <p className='text-gray-400'>de acerto</p>
            </div>
        </div>
        <div className="mt-6 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                <span className="text-lg">{correctAnswersCount} Corretas</span>
            </div>
            <div className="flex items-center space-x-2">
                <XCircleIcon className="w-6 h-6 text-red-500" />
                <span className="text-lg">{questions.length - correctAnswersCount} Incorretas</span>
            </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpenIcon className="w-6 h-6 mr-2"/> Revisão das Questões</h2>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = userAnswers.find(a => a.questionIndex === index);
            const isCorrect = userAnswer?.isCorrect;
            const selectedOption = userAnswer ? question.options[userAnswer.selectedAnswerIndex] : 'Não respondida';

            return (
              <details key={index} className="bg-neutral-light p-4 rounded-lg cursor-pointer group">
                <summary className="flex justify-between items-center font-semibold">
                  <div className="flex items-center gap-3">
                    <span>Questão {index + 1}</span>
                    <span className="text-xs bg-neutral px-2 py-0.5 rounded text-gray-400 group-open:bg-accent/20 group-open:text-accent transition-colors">
                      {question.banca}
                    </span>
                  </div>
                  {isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <XCircleIcon className="w-5 h-5 text-red-500"/>}
                </summary>
                <div className="mt-4 pt-4 border-t border-neutral">
                  <p className="mb-4 font-medium">{question.question}</p>
                  <p className={`p-2 rounded ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                    Sua resposta: <span className="font-bold">{String.fromCharCode(65 + (userAnswer?.selectedAnswerIndex ?? -1))})</span> {selectedOption}
                  </p>
                  <p className="p-2 rounded bg-blue-900/50 mt-2">
                    Resposta correta: <span className="font-bold">{String.fromCharCode(65 + question.correctAnswerIndex)})</span> {question.options[question.correctAnswerIndex]}
                  </p>
                  <div className="mt-4 p-4 bg-neutral rounded-lg">
                    <h4 className="font-bold text-accent">Explicação:</h4>
                    <p className="text-gray-300 mt-1">{question.explanation}</p>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-secondary rounded-lg hover:bg-primary transition-colors"
        >
          Refazer Simulado
        </button>
        <button
          onClick={onGoHome}
          className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-accent rounded-lg hover:bg-blue-600 transition-colors"
        >
          Ir para o Início
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
