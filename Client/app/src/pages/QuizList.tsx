import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, CircularProgress } from '@mui/material';
import "./styles/QuizList.css"; 

import type { Quiz } from "../types/quiz";
import { getAllQuizzes } from "../api/quizzes";
import api from "../api/axiosConfig";
import QuizCard from "../components/QuizCard";


const QuizList: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            history.push("/login");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllQuizzes();
                const mapped = data.map(quiz => ({
                    ...quiz,
                    isActive: Boolean(quiz.isActive)
                }));
                setQuizzes(mapped);
            } catch (err: any) {
                console.error("Error fetching quizzes:", err);
                if (err.message.includes("Unauthorized") || err.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [history]);

    return (
        <div className="quizListContainer">
            <div className="quizListHeader">
                <Typography component="h1" className="quizListTitle">
                    Your Prep Dashboard
                </Typography>
                <Typography className="quizListSubTitle">
                    Ready to test your knowledge? Select a quiz below to begin.
                </Typography>
            </div>

            {isLoading ? (
                <div className="loadingContainer">
                    <CircularProgress size={24} className="loadingSpinner" />
                    <span className="loadingText">Loading Quizzes...</span>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="emptyContainer">
                    <Typography variant="h6" gutterBottom>
                        No quizzes are currently available for your account.
                    </Typography>
                    <Typography>
                        Please check your course enrollment or try again later.
                    </Typography>
                </div>
            ) : (
                <div className="quizCardsWrapper">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="quizCardWrapper">
                            <QuizCard quiz={quiz} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;
