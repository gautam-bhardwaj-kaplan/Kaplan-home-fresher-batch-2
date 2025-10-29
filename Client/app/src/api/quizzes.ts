import type { Quiz } from "../types/quiz";
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/quizzes`;
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const res = await fetch(API_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) {
    window.location.replace('/login');
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: res.statusText };
    }
    throw new Error(error.message || "Failed to fetch quizzes");
  }
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
};