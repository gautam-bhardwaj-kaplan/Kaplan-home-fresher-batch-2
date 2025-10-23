// src/pages/QuizList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "../api/quizApi";
import type { Quiz } from "../types/quiz";
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import styles from './styles/QuizList.module.css';

import { Box, Typography, Paper, Button } from '@mui/material';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getQuizzes(1); 
        setQuizzes(data);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to fetch quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Quizzes..." />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Paper elevation={4} className={styles.quizListPaper}>
      <Typography variant="h4" component="h1" className={styles.title}>
        Available Quizzes
      </Typography>
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => {
          const hasPassed = quiz.passStatus === 'pass';
          const hasFailed = quiz.passStatus === 'fail';
          let buttonText = 'Start Quiz';
          if (hasPassed) {
            buttonText = 'Completed';
          } else if (hasFailed) {
            buttonText = 'Retake Quiz';
          }

          return (
            <Box key={quiz.id} className={styles.listItem}>
              {quiz.passStatus && (
                <div className={`${styles.statusBadge} ${hasPassed ? styles.passBadge : styles.failBadge}`}>
                  {hasPassed ? 'Passed' : 'Failed'}
                </div>
              )}
              <Typography variant="h6">{quiz.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{quiz.description}</Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                disabled={hasPassed} 
              >
                {buttonText} 
              </Button>
            </Box>
          );
        })
      ) : (
        <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
          No quizzes are available at the moment.
        </Typography>
      )}
    </Paper>
  );
};

export default QuizList;