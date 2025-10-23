import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getQuizById, submitQuiz } from "../api/quizApi";
import type { Quiz, Question, AnswerReview } from "../types/quiz";
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmationDialog from '../components/ConfirmationDialog';
import QuestionPalette from '../components/QuestionPalette';
import styles from './styles/QuizPage.module.css';

import { Paper, Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Divider, Snackbar, Alert, LinearProgress } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BookmarkIcon from '@mui/icons-material/Bookmark';

interface LocationState {
  reviewMode?: boolean;
  answers?: AnswerReview[];
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LocationState | null;
  const isReviewMode = locationState?.reviewMode || false;
  const reviewAnswers = locationState?.answers || [];

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reminderShown, setReminderShown] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const { quiz: quizData, questions: questionsData } = await getQuizById(quizId);
        setQuiz(quizData);
        setQuestions(questionsData);
        const storedEndTime = localStorage.getItem(`quizEndTime_${quizId}`);
        const remainingTime = storedEndTime ? Math.round((parseInt(storedEndTime, 10) - Date.now()) / 1000) : -1;
        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          if (storedEndTime) localStorage.removeItem(`quizEndTime_${quizId}`);
          const durationInSeconds = quizData.duration * 60;
          const newEndTime = Date.now() + durationInSeconds * 1000;
          localStorage.setItem(`quizEndTime_${quizId}`, newEndTime.toString());
          setTimeLeft(durationInSeconds);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err); setError("Failed to load the quiz.");
      } finally { setLoading(false); }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!isReviewMode && !loading && questions.length > 0) {
      window.history.pushState(null, '', window.location.href); 
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        
        window.history.pushState(null, '', window.location.href);
        alert("You cannot go back while the quiz is in progress. Please submit your answers or let the timer run out.");
      };
      window.addEventListener('popstate', handlePopState);
    
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isReviewMode, loading, questions.length]); 

  const handleActualSubmit = useCallback(async () => {
    if (!quizId || isReviewMode) return;
    localStorage.removeItem(`quizEndTime_${quizId}`); 
    try {
      const { submissionId, score, passStatus } = await submitQuiz({ quizId, answers, userId: 4 });
      navigate(`/result/${submissionId}`, { state: { score, totalQuestions: questions.length, passStatus } });
    } catch (err) {
      console.error("Error submitting quiz:", err); setError("Failed to submit the quiz.");
    }
  }, [quizId, answers, navigate, questions.length, isReviewMode]);

  useEffect(() => {
    if (isReviewMode || timeLeft === null) return;

    if (timeLeft <= 60 && !reminderShown) {
      setShowReminder(true);
      setReminderShown(true);
    }

    if (timeLeft <= 0) {
      handleActualSubmit(); 
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t !== null ? Math.max(t - 1, 0) : 0)), 1000); 
    return () => clearInterval(timer);
  }, [timeLeft, handleActualSubmit, isReviewMode, reminderShown]);

  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    let message = '';
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion); message = `Question ${currentQuestion + 1} unmarked.`;
    } else {
      newMarked.add(currentQuestion); message = `Question ${currentQuestion + 1} marked for review.`;
    }
    setMarkedForReview(newMarked); setSnackbar({ open: true, message });
  };
  const formatTime = (sec: number | null): string => {
    if (sec === null) return "0:00";
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  }
  const handleAnswerChange = (questionId: number, value: string) => setAnswers(prev => ({ ...prev, [questionId]: value }));
  const handleNext = () => setCurrentQuestion(q => Math.min(q + 1, questions.length - 1));
  const handlePrev = () => setCurrentQuestion(q => Math.max(q - 1, 0));

  if (loading) return <LoadingSpinner text="Loading Quiz..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!quiz || questions.length === 0) return <Alert severity="info">No quiz found or quiz has no questions.</Alert>; 

  const q = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;
  const answeredQuestionIndices = new Set(Object.keys(answers).map(id => questions.findIndex(ques => ques.id === parseInt(id))));
  const reviewAnswerInfo = isReviewMode ? reviewAnswers.find((ans: AnswerReview) => ans.questionId === q.id) : null;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSubmitClick = () => setConfirmOpen(true);

  return (
    <>
      <div className={styles.gridContainer}>
      
        <Paper elevation={4} className={styles.quizPaper}>
          <Box className={styles.progressContainer}>
            <LinearProgress variant="determinate" value={progress} className={styles.progressBar} />
            <Typography variant="body2" className={styles.progressText}>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
          </Box>
          <header className={styles.header}>
            <Typography variant="h4" component="h1" className={styles.quizTitle}>{quiz.title} {isReviewMode && "(Review)"}</Typography>
            {!isReviewMode && (
              <Box className={styles.timerBox}>
                <TimerIcon className={styles.timerIcon} />
                <Typography variant="h6" component="span">{formatTime(timeLeft)}</Typography>
              </Box>
            )}
          </header>
          <Divider className={styles.divider} />
          <main className={styles.mainContent}>
            <Typography variant="h5" component="p" className={styles.questionText}>{q.questionText}</Typography>
            <RadioGroup
              value={isReviewMode ? reviewAnswerInfo?.userAnswer : answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            >
              {q.options.map((opt, i) => {
                let optionClass = styles.optionLabel;
                if (isReviewMode && reviewAnswerInfo) {
                  const isCorrect = opt === q.correctAnswer;
                  const isUserChoice = opt === reviewAnswerInfo.userAnswer;
                  if (isCorrect) { optionClass += ` ${styles.correctAnswer}`; }
                  else if (isUserChoice) { optionClass += ` ${styles.wrongAnswer}`; }
                }
                return (
                  <FormControlLabel
                    key={i} value={opt}
                    control={<Radio sx={ isReviewMode && opt === q.correctAnswer ? { color: 'green !important' } : {} } />}
                    label={opt} disabled={isReviewMode} className={optionClass}
                    sx={{ '& .MuiFormControlLabel-label': (answers[q.id] === opt || (isReviewMode && reviewAnswerInfo?.userAnswer === opt)) ? { fontWeight: 'bold' } : {} }}
                  />
                );
              })}
            </RadioGroup>
            {isReviewMode && reviewAnswerInfo?.explanation && (
              <Alert icon={<LightbulbIcon />} severity="info" className={styles.explanationAlert}>
                <Typography variant="body1"><strong>Explanation:</strong> {reviewAnswerInfo.explanation}</Typography>
              </Alert>
            )}
          </main>
          <footer className={styles.footer}>
            <Button variant="outlined" onClick={handlePrev} disabled={currentQuestion === 0}>Previous</Button>
            {!isReviewMode && (
              <Button variant="outlined" startIcon={<BookmarkIcon />} onClick={handleMarkForReview}>
                {markedForReview.has(currentQuestion) ? 'Unmark' : 'Mark for Review'}
              </Button>
            )}
            {isLastQuestion ? (
              isReviewMode ? (
                <Button variant="contained" onClick={() => navigate('/')}>Back to Home</Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleSubmitClick} disabled={!allQuestionsAnswered}>Submit</Button>
              )
            ) : (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            )}
          </footer>
        </Paper>

        {!isReviewMode && (
          <QuestionPalette
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestion}
            answeredQuestions={answeredQuestionIndices}
            markedForReview={markedForReview}
            onQuestionSelect={setCurrentQuestion}
          />
        )}
      </div>

      <ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); handleActualSubmit(); }} title="Confirm Submission" message="Are you sure you want to submit your answers?" />
      <Snackbar open={showReminder} autoHideDuration={6000} onClose={() => setShowReminder(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowReminder(false)} severity="warning" className={styles.snackbar}>
          Only 1 minute remaining!
        </Alert>
      </Snackbar>
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ open: false, message: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ open: false, message: '' })} severity="info" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuizPage;