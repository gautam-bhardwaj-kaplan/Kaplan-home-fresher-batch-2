import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import api from "../api/axiosConfig";
import { 
  Container, Typography, Button, CircularProgress, Paper 
} from "@mui/material";
import type { Quiz } from "../types/quiz";
import "./styles/Instructions.css";

const Instructions: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const history = useHistory();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`);
        setQuiz(response.data.quiz);
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        if (err.response && err.response.status === 401) {
          history.push("/login");
        } else {
          setError("Failed to fetch quiz details. The quiz may not exist or network is unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId, history]);

  const handleStartQuiz = () => {
  if (quizId) {   
    history.push(`/quiz/${quizId}`);
  }
};

  if (loading)
    return (
      <div className="loading-container">
        <CircularProgress size={30} className="loading-spinner" />
        <Typography variant="h6" className="loading-text">
          Loading Quiz Details...
        </Typography>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <Container maxWidth="sm" className="error-content">
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            onClick={() => history.push("/quizzes")} 
            variant="outlined"
          >
            Go Back to Quizzes
          </Button>
        </Container>
      </div>
    );

  if (!quiz)
    return (
      <div className="notfound-container">
        <Typography variant="h5" color="text.secondary">
          Quiz ID {quizId} Not Found.
        </Typography>
      </div>
    );

  return (
    <div className="instructions-page">
      <Container maxWidth="md" className="instructions-container">
        <Typography variant="h3" component="h1" align="center" className="quiz-title">
          {quiz?.title ?? "Untitled Quiz"}
        </Typography>

        <Paper elevation={4} className="instructions-card">
          <Typography variant="h5" component="h2" className="instructions-header">
            <span className="accent-bar">|</span> General Instructions
          </Typography>

          <div className="info-box">
            <div className="info-item">
              <Typography variant="h6" className="info-label">Duration</Typography>
              <Typography variant="h4" className="info-value">{quiz?.duration ? `${quiz.duration}m` : "N/A"}</Typography>
            </div>
            <div className="info-item">
              <Typography variant="h6" className="info-label">Total Marks</Typography>
              <Typography variant="h4" className="info-value">{quiz?.total_marks ?? "N/A"}</Typography>
            </div>
          </div>

          <Typography variant="body1" className="quiz-description">
            {quiz?.description || "No specific description provided."}
          </Typography>

          <ul className="instructions-list">
            <li>Read all questions carefully before answering.</li>
            <li>Each question must be answered before submission.</li>
            <li>Each Question Carries <b>1</b> mark.</li>
            <li>Ensure a stable internet connection during the quiz.</li>
            <li>Do not refresh or close the browser once the quiz begins.</li>
            <li>The timer starts automatically when you begin the quiz.</li>
            <li>Review all your answers before submitting.</li>
          </ul>

          <div className="start-button-container">
            <Button 
              onClick={handleStartQuiz} 
              variant="contained" 
              size="large" 
              className="start-button"
            >
              Start Quiz
            </Button>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default Instructions;
