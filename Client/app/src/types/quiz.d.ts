export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
  isActive: boolean;
}

export interface QuizResult {
  quizTitle: string;
  score: number;
  totalMarks: number;
  submitted_at: string;
}