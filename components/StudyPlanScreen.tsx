
import React from 'react';
import { StudyPlan } from '../types';

interface StudyPlanScreenProps {
  plan: StudyPlan;
  onNewPlan: () => void;
  onGoToQuiz: () => void;
}

const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ plan, onNewPlan, onGoToQuiz }) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-neutral-light text-center p-8 rounded-2xl shadow-2xl mb-8">
        <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
        <p className="text-gray-400">Seu plano de estudos personalizado está pronto!</p>
      </div>
      <div className="space-y-8">
        {plan.weeklyPlan.map((week) => (
          <div key={week.week} className="bg-neutral-light p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-accent mb-1">Semana {week.week}</h2>
            <p className="text-gray-300 mb-4 font-semibold">Foco: {week.focus}</p>
            <div className="space-y-4">
              {week.dailySchedule.filter(d => d.activities.length > 0).map((day) => (
                <div key={day.day} className="bg-neutral p-4 rounded-lg">
                  <h3 className="font-bold text-lg">{day.day}</h3>
                  <ul className="mt-2 list-disc list-inside text-gray-300 space-y-1">
                    {day.activities.map((activity, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-white">{activity.subject}:</span> {activity.activity} ({activity.duration})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={onGoToQuiz} className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-primary rounded-lg hover:bg-secondary transition-colors">
          Praticar com Simulado
        </button>
        <button onClick={onNewPlan} className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-accent rounded-lg hover:bg-blue-600 transition-colors">
          Gerar Novo Plano
        </button>
      </div>
    </div>
  );
};

export default StudyPlanScreen;
