import axios from 'axios';
import type { Quiz, QuizDetails, QuizSubmission, ResultData, QuizSubmissionResponse } from '../types/quiz';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getQuizzes = async (): Promise<Quiz[]> => {
  const { data } = await api.get('/quizzes');
  return data;
};

export const getQuizById = async (quizId: string): Promise<QuizDetails> => {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return data;
};

export const submitQuiz = async (submission: QuizSubmission): Promise<QuizSubmissionResponse> => {
  const { data } = await api.post(`/quizzes/submit`, submission);
  return data;
};

export const getResults = async (submissionId: string): Promise<ResultData> => {
  const { data } = await api.get(`/quizzes/results/${submissionId}`);
  return data;
};

