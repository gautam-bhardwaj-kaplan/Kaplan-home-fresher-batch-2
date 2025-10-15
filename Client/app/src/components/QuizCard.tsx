import React from "react";
import type { Quiz } from "../types/quiz";
import { Card, CardContent, Typography, Button, Chip, Box } from "@mui/material";
import { useHistory } from "react-router-dom"; 

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
    <Card
      variant="outlined"
      sx={{
        maxWidth: 345,
        m: 1,
        borderRadius: 2,
        boxShadow: 3,
        transition: "0.3s",
        display: "flex",
        flexDirection: "column", 
        height: "100%", 
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ flexGrow: 1 }}>
          {quiz.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
