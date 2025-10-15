import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { Container, Typography, Box, Button, CircularProgress, Paper } from '@mui/material';
import type { Quiz } from "../types/quiz";

const DARK_BLUE = '#2B1871';
const ACCENT_GOLD = '#FFC82E'; 
const LIGHT_BG = '#F5F7FA';

const Instructions: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const history = useHistory();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      const token = localStorage.getItem("token"); 
      try {
        const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setQuiz(response.data);
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        if (err.response && err.response.status === 401) {
          localStorage.clear(); 
          history.push("/login"); 
        }
        setError("Failed to fetch quiz details. The quiz may not exist or network is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId, history]);

  const handleStartQuiz = () => {
    if (!quiz?.isActive) {
      alert("This quiz is not active yet!");
      return;
    }
    history.push(`/quiz/${quizId}`);
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT_BG }}>
      <CircularProgress size={30} sx={{ color: DARK_BLUE }} />
      <Typography variant="h6" sx={{ ml: 2, color: DARK_BLUE }}>Loading Quiz Details...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', backgroundColor: LIGHT_BG }}> 
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>{error}</Typography>
        <Button onClick={() => history.push('/quizzes')} variant="outlined" sx={{ color: DARK_BLUE, borderColor: DARK_BLUE }}>
          Go Back to Quizzes
        </Button>
      </Container>
    </Box>
  );

  if (!quiz) return (
    <Box sx={{ minHeight: '100vh', backgroundColor: LIGHT_BG, py: 8, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">Quiz ID {quizId} Not Found.</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: LIGHT_BG, fontFamily: 'Roboto, sans-serif' }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" align="center"
          sx={{
            mb: 4, fontWeight: 600, color: DARK_BLUE,
            borderBottom: `2px solid ${ACCENT_GOLD}`, paddingBottom: '8px'
          }}>
          {quiz.title}
        </Typography>

        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: '12px' }}>
          <Typography variant="h5" component="h2" sx={{ color: DARK_BLUE, mb: 3, fontWeight: 600 }}>
            <span style={{ color: ACCENT_GOLD }}>|</span> General Instructions
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, mb: 4, p: 2, borderRadius: '6px', backgroundColor: LIGHT_BG, border: '1px solid #E0E0E0' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: DARK_BLUE }}>Duration</Typography>
              <Typography variant="h4" sx={{ color: ACCENT_GOLD, fontWeight: 700 }}>{quiz.duration}m</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: DARK_BLUE }}>Total Marks</Typography>
              <Typography variant="h4" sx={{ color: ACCENT_GOLD, fontWeight: 700 }}>{quiz.total_marks}</Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ color: '#555', mb: 3, fontSize: '1.05rem' }}>
            {quiz.description || 'No specific description provided.'}
          </Typography>

          <Box component="ul" sx={{ lineHeight: "1.8", fontSize: "16px", ml: 0, pl: 3, color: '#333' }}>
            <Typography component="li">Read all questions carefully before answering.</Typography>
            <Typography component="li">Each question must be answered before submission.</Typography>
            <Typography component="li">Once submitted, you cannot retake the quiz.</Typography>
            <Typography component="li">Ensure a stable internet connection during the quiz.</Typography>
            <Typography component="li">Do not refresh or close the browser once the quiz begins.</Typography>
            <Typography component="li">The timer starts automatically when you begin the quiz.</Typography>
            <Typography component="li">Review all your answers before submitting.</Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Button
              onClick={handleStartQuiz}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: DARK_BLUE,
                color: 'white',
                padding: "12px 40px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: 700,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                '&:hover': { backgroundColor: '#1F115C', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }
              }}
            >
              Start Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Instructions;
