import React from "react";
import type { Quiz } from "../types/quiz";
import { Card, CardContent, Typography, Button, Chip, Box } from "@mui/material";
import { useHistory } from "react-router-dom"; 
import "../pages/styles/QuizCard.css";


interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const history = useHistory();

  const handleStart = () => {
    if (quiz.isActive) {
      history.push(`/instructions/${quiz.id}`);
    } else {
      alert("This quiz is not active yet!");
    }
  };

  return (
    <Card className="quiz-card">
      <CardContent className="quiz-card-content">
        <Typography variant="h6" component="div" gutterBottom className="quiz-card-title">
          {quiz.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom className="quiz-card-description">
          {quiz.description}
        </Typography>

        <Box className="quiz-card-footer">
          <Typography variant="caption" color="text.secondary">
            Duration: {quiz.duration} mins
          </Typography>
          <Chip
            label={quiz.isActive ? "Active" : "Inactive"}
            color={quiz.isActive ? "success" : "error"}
            size="small"
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={!quiz.isActive}
          onClick={handleStart}
          className="quiz-card-button"
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
