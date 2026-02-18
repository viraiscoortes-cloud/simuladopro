
import React, { useState } from 'react';
import { StudyPlanSettings } from '../types';
import { CalendarCheckIcon } from './Icons';

interface StudyPlanConfigurationScreenProps {
  onGeneratePlan: (settings: StudyPlanSettings) => void;
  onBack: () => void;
}

const StudyPlanConfigurationScreen: React.FC<StudyPlanConfigurationScreenProps> = ({ onGeneratePlan, onBack }) => {
  const [goal, setGoal] = useState('Aprovação no Concurso do Banco do Brasil');
  const [subjects, setSubjects] = useState('Língua Portuguesa\nRaciocínio Lógico\nConhecimentos Bancários\nInformática');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15);
  const [durationInWeeks, setDurationInWeeks] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectsArray = subjects.split('\n').filter(s => s.trim() !== '');
    if (subjectsArray.length === 0) {
        alert("Por favor, insira pelo menos uma matéria.");
        return;
    }
    onGeneratePlan({ goal, subjects: subjectsArray, hoursPerWeek, durationInWeeks });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg p-8 space-y-8 bg-neutral-light rounded-2xl shadow-2xl">
        <div className="text-center">
          <CalendarCheckIcon className="mx-auto w-16 h-16 text-accent" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Plano de Estudos Personalizado</h1>
          <p className="mt-2 text-gray-400">Defina suas metas para a IA criar seu cronograma.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">
              Objetivo Principal
            </label>
            <input id="goal" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex: Passar no concurso X" className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white" required />
          </div>
          <div>
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-300 mb-2">
              Matérias (uma por linha)
            </label>
            <textarea id="subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} rows={4} className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white" placeholder="Direito Constitucional&#10;Língua Portuguesa&#10;Matemática Financeira" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-300 mb-2">
                Horas / Semana
              </label>
              <input id="hoursPerWeek" type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} min="1" max="60" className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white" required />
            </div>
            <div>
              <label htmlFor="durationInWeeks" className="block text-sm font-medium text-gray-300 mb-2">
                Duração (semanas)
              </label>
              <select id="durationInWeeks" value={durationInWeeks} onChange={(e) => setDurationInWeeks(Number(e.target.value))} className="w-full px-4 py-2 bg-neutral rounded-lg border border-neutral-light focus:ring-accent focus:border-accent text-white">
                <option value={4}>4 semanas</option>
                <option value={8}>8 semanas</option>
                <option value={12}>12 semanas</option>
                <option value={16}>16 semanas</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
            <button type="submit" className="w-full py-3 px-4 font-bold text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-neutral-dark transition-transform transform hover:scale-105">
              Gerar Plano
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
export default StudyPlanConfigurationScreen;
