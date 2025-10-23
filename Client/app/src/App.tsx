import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, Typography } from '@mui/material';
import { theme } from './components/theme';
import QuizList from "./pages/QuizList";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import './index.css'; 

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router>
       
        <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/quizzes" />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/result/:submissionId" element={<ResultPage />} />
           
            <Route path="*" element={<Typography color="white" align="center" sx={{ mt: 5 }}>Page Not Found</Typography>} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;