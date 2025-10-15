import type { Quiz } from "../types/quiz";

const API_URL = "http://localhost:5000/api/quizzes";

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const token = localStorage.getItem("token"); 

  const res = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
};
