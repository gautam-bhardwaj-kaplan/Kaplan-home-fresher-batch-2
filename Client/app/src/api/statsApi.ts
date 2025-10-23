import axios from "axios";

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        window.location.replace('/login'); 
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export interface QuizResult {
  quizTitle: string;
  score: number;
  totalMarks: number;
  submitted_at: string;
}

export interface StudentStats {
  totalQuizzesAttended: number;
  activeQuizzes: number;
  inactiveQuizzes: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchPerformanceData = async (): Promise<QuizResult[]> => {
  try {
    const response = await axios.get<QuizResult[]>(
      `${API_BASE_URL}/student/performance`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(error.response.statusText || "Failed to fetch performance data");
    }
    throw error;
  }
};

export const fetchStudentStats = async (): Promise<StudentStats> => {
  try {
    const response = await axios.get<StudentStats>(
      `${API_BASE_URL}/student/stats`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(error.response.statusText || "Failed to fetch student stats");
    }
    throw error;
  }
};