export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  type: 'MCQ' | 'subjective'; 
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  total_marks?: number;

  // Backend fields (from DB)
  is_active?: number;
  is_attempted?: number;
  is_passed?: number;

  // Derived frontend-friendly flags
  isActive: boolean;
  isAttempted?: boolean;
  isPassed?: boolean;

  passStatus?: 'pass' | 'fail' | null;
}



export interface QuizDetails {
  quiz: Quiz;
  questions: Question[];
}

export interface QuizSubmission {
  quizId: number;
  userId: number;
  answers: Record<number, string>; 
}

export interface QuizSubmissionResponse {
  submissionId: number;
  score: number;
  passStatus: 'pass' | 'fail';
  totalQuestions: number; 
}

export interface AnswerReview {
  questionId: number;
  questionText: string;
  userAnswer: string | null; 
  correctAnswer: string;
  isCorrect: number; 
  explanation?: string;
  type?: 'MCQ' | 'subjective';
}

export interface ResultData {
  quizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passStatus: 'pass' | 'fail';
  questions: AnswerReview[];
}

// Add export
export interface CompletedSubmission {
  submissionId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}