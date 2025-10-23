
export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  passStatus?: 'pass' | 'fail' | null; 
}

export interface Question {
  id: number;
  questionText: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizDetails {
  quiz: Quiz;
  questions: Question[];
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<number, string>;
  userId: number;
}

export interface QuizSubmissionResponse {
  submissionId: number;
  score: number;
  passStatus: 'pass' | 'fail';
}

export interface AnswerReview extends Question {
  questionId: number;
  userAnswer: string | null;
  isCorrect: boolean;
}

export interface ResultData {
  quizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passStatus: 'pass' | 'fail';
  questions: AnswerReview[];
}

