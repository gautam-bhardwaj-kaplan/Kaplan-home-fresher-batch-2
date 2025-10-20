import axios from "axios";


axios.defaults.withCredentials = true;

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


const API_BASE_URL = "http://localhost:5000";

export const fetchPerformanceData = async (): Promise<QuizResult[]> => {
  try {
    const response = await axios.get<QuizResult[]>(
      `${API_BASE_URL}/api/student/performance`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw error.response;
    }
    throw error;
  }
};

export const fetchStudentStats = async (): Promise<StudentStats> => {
  try {
    const response = await axios.get<StudentStats>(
      `${API_BASE_URL}/api/student/stats`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw error.response;
    }
    throw error;
  }
};
