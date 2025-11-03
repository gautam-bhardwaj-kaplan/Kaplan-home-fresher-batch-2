import React, { useEffect, useState, useCallback } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom"; 
import { getQuizById, submitQuiz } from "../api/quizApi";
import type { Quiz, Question, AnswerReview } from "../types/quiz.ts";
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmationDialog from '../components/ConfirmationDialog.tsx';
import QuestionPalette from '../components/QuestionPalette';
import styles from './styles/QuizPage.module.css';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Divider, Snackbar, Alert, Paper, LinearProgress } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BookmarkIcon from '@mui/icons-material/Bookmark';

interface LocationState {
  reviewMode?: boolean;
  answers?: AnswerReview[];
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const history = useHistory(); 
  const location = useLocation<LocationState | null>(); 

  const locationState = location.state;
  const isReviewMode = locationState?.reviewMode || false;
  const reviewAnswers = locationState?.answers || [];

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reminderShown, setReminderShown] = useState(false);

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
          const durationInSeconds = (quizData.duration || 30) * 60;
          const newEndTime = Date.now() + durationInSeconds * 1000;
          localStorage.setItem(`quizEndTime_${quizId}`, newEndTime.toString());
          setTimeLeft(durationInSeconds);
        }

        if (!isReviewMode) {
          const savedAnswers = localStorage.getItem(`quizAnswers_${quizId}`);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
        }

      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load the quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, isReviewMode]); 

  useEffect(() => {
    if (!isReviewMode && !loading && questions.length > 0) {
      window.history.pushState(null, '', window.location.href); 
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
        alert("You cannot go back while the quiz is in progress. Please submit your answers.");
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isReviewMode, loading, questions.length]); 
 
  useEffect(() => {
    if (!isReviewMode && quizId && Object.keys(answers).length > 0) {
      localStorage.setItem(`quizAnswers_${quizId}`, JSON.stringify(answers));
    }
  }, [answers, quizId, isReviewMode]); 

 
  const handleActualSubmit = useCallback(async () => {
    if (!quizId || isReviewMode) return;
    
   
    localStorage.removeItem(`quizEndTime_${quizId}`);
    localStorage.removeItem(`quizAnswers_${quizId}`); 
    
    try {
      const submissionData = { quizId: parseInt(quizId, 10), answers };
      const { submissionId, score, totalQuestions, passStatus } = await submitQuiz(submissionData);
      history.push(`/result/${submissionId}`, { score, totalQuestions, passStatus });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit the quiz.");
    }
  }, [quizId, answers, history, isReviewMode]);

 
  useEffect(() => {
    if (isReviewMode || timeLeft === null) return;
    if (timeLeft <= 30 && !reminderShown) {
      setShowReminder(true);
      setReminderShown(true);
    }
    if (timeLeft <= 0) {
      handleActualSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleActualSubmit, isReviewMode, reminderShown]);

 
  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarkedForReview(newMarked);
  };

  const formatTime = (sec: number | null): string => {
    if (sec === null) return "0:00";
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    if (isReviewMode) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => setCurrentQuestion(q => Math.min(q + 1, questions.length - 1));
  const handlePrev = () => setCurrentQuestion(q => Math.max(q - 1, 0));


  if (loading) return <LoadingSpinner text="Loading Quiz..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!quiz || questions.length === 0) return <Alert severity="info">No quiz found.</Alert>;

  const q = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;
  const answeredQuestionIndices = new Set(Object.keys(answers).map(id => questions.findIndex(ques => ques.id === parseInt(id))));

  const reviewAnswerInfo = isReviewMode
    ? reviewAnswers.find((ans: AnswerReview) => ans.question_id === q.id)
    : null;

  let radioValue = '';
  if (isReviewMode && reviewAnswerInfo) {
    radioValue = reviewAnswerInfo.user_answer || '';
  } else if (!isReviewMode) {
    radioValue = answers[q.id] || '';
  }
 

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
            <Typography variant="h4" component="h1" className={styles.quizTitle}>
              {quiz.title} {isReviewMode && "(Review)"}
            </Typography>
            {!isReviewMode && (
              <Box className={styles.timerBox}>
                <TimerIcon className={styles.timerIcon} />
                <Typography variant="h6" component="span">{formatTime(timeLeft)}</Typography>
              </Box>
            )}
          </header>
          <Divider className={styles.divider} />
          <main className={styles.mainContent}>
            <Typography variant="h5" component="p" className={styles.questionText}>{q.question_text}</Typography>
            
            <RadioGroup
              value={radioValue}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            >
              {q.options.map((opt: string, i: number) => {
                let optionClass = styles.optionLabel;
                
                if (isReviewMode && reviewAnswerInfo) {
                  if (opt === String(q.correct_answer)) {
                    optionClass += ` ${styles.correctAnswer}`; 
                  } 
                  else if (opt === String(reviewAnswerInfo.user_answer) && !reviewAnswerInfo.is_correct) {
                    optionClass += ` ${styles.wrongAnswer}`;
                  }
                }

                return (
                  <FormControlLabel
                    key={i}
                    value={opt}
                    control={<Radio />}
                    label={opt}
                    disabled={isReviewMode}
                    className={optionClass}
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
                <Button variant="contained" onClick={() => history.push('/')}>Back to Home</Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleSubmitClick} disabled={!allQuestionsAnswered}>Submit</Button>
              )
            ) : (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            )}
          </footer>
        </Paper>
        {!isReviewMode && (
          <Paper elevation={4} className={styles.palettePaper}>
          <QuestionPalette
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestion}
            answeredQuestions={answeredQuestionIndices}
            markedForReview={markedForReview}
            onQuestionSelect={setCurrentQuestion}
          />
          </Paper>
        )}
      </div>
      <ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); handleActualSubmit(); }} title="Confirm Submission" message="Are you sure you want to submit your answers?" />
      <Snackbar open={showReminder} autoHideDuration={6000} onClose={() => setShowReminder(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowReminder(false)} severity="warning" className={styles.snackbar}>
          Only 30 seconds remaining!
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuizPage;