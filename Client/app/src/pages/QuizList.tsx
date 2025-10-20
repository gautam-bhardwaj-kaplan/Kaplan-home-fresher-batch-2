import React, { useEffect, useState } from "react";
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import type { Quiz } from "../types/quiz";
import { getAllQuizzes } from "../api/quizzes"; 
import QuizCard from "../components/QuizCard";
import "../pages/styles/QuizList.css";

const QuizList: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: Quiz[] = await getAllQuizzes();
                const mappedQuizzes: Quiz[] = data.map((q) => ({
                    ...q,
                    isActive: q.is_active === 1,
                }));
                setQuizzes(mappedQuizzes);
            } catch (err: unknown) {
                console.error("Error fetching quizzes:", err);
            } finally {
                setIsLoading(false); 
            }
        };
        fetchData();
    }, []);

    return (
        <Box className="quizListContainer">
            <Container maxWidth="xl" className="quizListContent">

                {/* Intro Section */}
                <Box className="quizListHeader">
                    <Typography variant="h4" className="quizListTitle">
                        Your Prep Dashboard
                    </Typography>
                    <Typography variant="body1" className="quizListSubTitle">
                        Ready to test your knowledge? Select a quiz below to begin.
                    </Typography>
                </Box>

                {/* Loading / Empty / Quiz Cards */}
                {isLoading ? (
                    <Box className="loadingContainer">
                        <CircularProgress size={24} className="loadingSpinner" />
                        <Typography className="loadingText">Loading Quizzes...</Typography>
                    </Box>
                ) : quizzes.length === 0 ? (
                    <Box className="emptyContainer">
                        <Typography variant="h6" gutterBottom>No quizzes are currently available for your account.</Typography>
                        <Typography>Please check your course enrollment or try again later.</Typography>
                    </Box>
                ) : (
                    <Box className="quizCardsWrapper">
                        {quizzes.map((quiz) => (
                            <Box key={quiz.id} className="quizCardWrapper">
                                <QuizCard quiz={quiz} startButtonColor="#2B1871" /> 
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default QuizList;
