import type { Quiz } from "../types/quiz";

const API_URL = "http://localhost:5000/api/quizzes";

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const res = await fetch(API_URL, {
    method: 'GET',
    credentials: 'include', 
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch quizzes");
  }
  
  return res.json();
};
