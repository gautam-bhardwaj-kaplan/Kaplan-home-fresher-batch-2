import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; 
import { Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress } from '@mui/material'; 
import type { Quiz } from "../types/quiz";
import { getAllQuizzes } from "../api/quizzes"; 
import QuizCard from "../components/QuizCard";

import KaplanLogoSource from '../assets/images/kaplan logo.png'; 

const DARK_BLUE = '#2B1871';
const LIGHT_BG = '#F5F7FA'; 

const KaplanLogo = () => (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <img 
            src={KaplanLogoSource} 
            alt="Kaplan Logo"
            style={{ 
                height: '60px', 
                marginRight: '30px',
            }} 
        />
        
        <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: 'white',
            fontFamily: 'Roboto, sans-serif'
        }}>
            
        </Typography>
    </Box>
);

const QuizList: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const history = useHistory(); 
    const handleLogout = () => {
        localStorage.removeItem("token");
        history.push("/login");
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllQuizzes(); 
                const mapped: Quiz[] = data.map((q: any) => ({
                    ...q,
                    isActive: q.is_active === 1,
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
        <Box sx={{ minHeight: '100vh', backgroundColor: LIGHT_BG, fontFamily: 'Roboto, sans-serif' }}>
            
            <AppBar position="static" sx={{ backgroundColor: DARK_BLUE }}>
                <Toolbar>
                    <KaplanLogo /> 
                    <Typography variant="subtitle1" sx={{ mr: 2, color: 'rgba(255,255,255,0.8)' }}>
                        WELCOME
                    </Typography>
                    <Button 
                        color="inherit" 
                        onClick={handleLogout} 
                        sx={{ 
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
                
                <Box 
                    sx={{ 
                        pb: 3, 
                        borderBottom: '1px solid #E0E0E0', 
                        mb: 4, 
                        textAlign: 'left' 
                    }}
                >
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 400, 
                            color: '#333', 
                            mb: 0.5 
                        }}
                    >
                        Your Prep Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Ready to test your knowledge? Select a quiz below to begin.
                    </Typography>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress size={24} sx={{ color: DARK_BLUE }} />
                        <Typography variant="h6" sx={{ ml: 2, color: DARK_BLUE }}>Loading Quizzes...</Typography>
                    </Box>
                ) : quizzes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No quizzes are currently available for your account.
                        </Typography>
                        <Typography color="text.secondary">
                            Please check your course enrollment or try again later.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {quizzes.map((quiz) => (
                            <Box 
                                key={quiz.id} 
                                sx={{ 
                                    width: { 
                                        xs: '100%', 
                                        sm: 'calc(50% - 10px)', 
                                        md: 'calc(33.33% - 13.33px)', 
                                        lg: 'calc(25% - 15px)' 
                                    }, 
                                    display: 'flex' 
                                }}
                            >
                                <QuizCard quiz={quiz} /> 
                            </Box>
                        ))}
                    </Box>
                )}

            </Container>
        </Box>
    );
};

export default QuizList;
