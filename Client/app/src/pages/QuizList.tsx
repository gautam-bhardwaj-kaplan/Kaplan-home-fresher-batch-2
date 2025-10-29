import React, { useEffect, useState, useMemo } from "react"; 
import { useLocation } from "react-router-dom"; 
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import type { Quiz } from "../types/quiz";
import { getAllQuizzes } from "../api/quizzes"; 
import QuizCard from "../components/QuizCard";
import "../pages/styles/QuizList.css";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};


const QuizList: React.FC = () => {
    const query = useQuery(); 
    const filterStatus = query.get("status"); 

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: any[] = await getAllQuizzes();
                const mappedQuizzes: Quiz[] = data.map((q) => ({
                    ...q,
                    isActive: q.is_passed === 0,
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


    const filteredQuizzes = useMemo(() => {
        if (!filterStatus) {
            return quizzes; 
        }

        if (filterStatus === 'active') {
            return quizzes.filter(q => q.isActive);
        }

        if (filterStatus === 'inactive') {
            return quizzes.filter(q => !q.isActive);
        }

        return quizzes; 
    }, [quizzes, filterStatus]);
    
    const listTitle = useMemo(() => {
        if (filterStatus === 'active') return 'Active Quizzes';
        if (filterStatus === 'inactive') return 'Completed Quizzes';
        return 'All Available Quizzes';
    }, [filterStatus]);


    return (
        <Box className="quizListContainer">
            <Container maxWidth="xl" className="quizListContent">

                <Box className="quizListHeader">
                    <Typography variant="h4" className="quizListTitle">
                        {listTitle} 
                    </Typography>
                    <Typography variant="body1" className="quizListSubTitle">
                        {filterStatus ? 'Viewing filtered list' : 'Ready to test your knowledge? Select a quiz below to begin.'}
                    </Typography>
                </Box>

                {isLoading ? (
                    <Box className="loadingContainer">
                        <CircularProgress size={24} className="loadingSpinner" />
                        <Typography className="loadingText">Loading Quizzes...</Typography>
                    </Box>
                ) : filteredQuizzes.length === 0 ? ( 
                    <Box className="emptyContainer">
                        <Typography variant="h6" gutterBottom>No {filterStatus} quizzes found.</Typography>
                        <Typography>Please check your course enrollment or try again later.</Typography>
                    </Box>
                ) : (
                    <Box className="quizCardsWrapper">
                        {filteredQuizzes.map((quiz) => ( 
                            <Box key={quiz.id} className="quizCardWrapper">
                                <QuizCard quiz={quiz} isAttempted={(quiz as any).is_attempted === 1} />
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default QuizList;