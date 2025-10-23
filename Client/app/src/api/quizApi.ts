import axios from 'axios';
import type { Quiz, QuizDetails, QuizSubmission, ResultData, QuizSubmissionResponse } from '../types/quiz';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});


export const getQuizzes = async (userId: number = 1): Promise<Quiz[]> => {
  const { data } = await api.get('/quizzes', { params: { userId } });
  return data;
};

export const getQuizById = async (quizId: string): Promise<QuizDetails> => {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return data;
};

export const submitQuiz = async (submission: QuizSubmission): Promise<QuizSubmissionResponse> => {
  const { data } = await api.post('/quizzes/submit', submission);
  return data;
};

export const getResults = async (submissionId: string): Promise<ResultData> => {
  const { data } = await api.get(`/results/${submissionId}`);
  return data;
};

