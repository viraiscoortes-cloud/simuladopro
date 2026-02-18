
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  banca: string;
}

export interface QuizSettings {
  subject: string;
  numQuestions: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswerIndex: number;
  isCorrect: boolean;
}

export interface StudyPlanSettings {
  goal: string;
  subjects: string[];
  hoursPerWeek: number;
  durationInWeeks: number;
}

export interface StudyActivity {
  subject: string;
  activity: string;
  duration: string;
}

export interface DailySchedule {
  day: string;
  activities: StudyActivity[];
}

export interface WeeklyPlan {
  week: number;
  focus: string;
  dailySchedule: DailySchedule[];
}

export interface StudyPlan {
  title: string;
  weeklyPlan: WeeklyPlan[];
}

export interface QuizResult {
    subject: string;
    totalQuestions: number;
    correctAnswers: number;
    timestamp: number;
}
