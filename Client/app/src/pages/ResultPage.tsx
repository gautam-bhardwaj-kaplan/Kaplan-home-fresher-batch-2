import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getResults } from "../api/quizApi";
import type { ResultData } from "../types/quiz";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import styles from './styles/ResultPage.module.css';

import { Paper, Box, Typography, Button, Divider, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplayIcon from '@mui/icons-material/Replay';

const ResultPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const immediateScore = location.state?.score;
  const totalQuestions = location.state?.totalQuestions;
  const immediatePassStatus = location.state?.passStatus;

  useEffect(() => {
    if (!submissionId) { setError("Submission ID not found."); setLoading(false); return; }
    const fetchResultData = async () => {
      try {
        const data = await getResults(submissionId); setResult(data);
      } catch (err) { console.error("Error fetching results:", err); setError("Could not load your detailed results.");
      } finally { setLoading(false); }
    };
    fetchResultData();
  }, [submissionId]);

  const handleReview = () => {
    if (!result) return;
    navigate(`/quiz/${result.quizId}`, { state: { reviewMode: true, answers: result.questions } });
  };

  const handleRetake = () => {
    if (!result) return;
    localStorage.removeItem(`quizEndTime_${result.quizId}`);
    navigate(`/quiz/${result.quizId}`);
  };

  if (loading && typeof immediateScore === 'undefined') return <LoadingSpinner text="Calculating Results..." />;
  if (error) return <ErrorAlert message={error} />;

  const displayScore = result?.score ?? immediateScore;
  const displayTotal = result?.totalQuestions ?? totalQuestions;
  const displayPassStatus = result?.passStatus ?? immediatePassStatus;
  const quizTitle = result?.quizTitle;
  const isPass = displayPassStatus === 'pass';

  const percentage = (typeof displayScore !== 'undefined' && displayTotal)
    ? Math.round((displayScore / displayTotal) * 100)
    : null;

  return (
    <Paper elevation={4} className={styles.resultPaper}>
      <Typography variant="h4" component="h1">
        {quizTitle || 'Quiz Complete!'}
      </Typography>
      <Divider className={styles.divider} />
      {typeof displayScore !== 'undefined' ? (
        <Box>
          <Typography variant="body1" className={`${styles.statusText} ${isPass ? styles.passText : styles.failText}`}>
            {displayPassStatus ? (isPass ? "Status: Passed" : "Status: Failed") : "Calculating status..."}
          </Typography>
          <Typography variant="body1">You scored:</Typography>
          <Typography component="p" className={styles.scoreText}>
            {displayScore} / {displayTotal}
          </Typography>
          {percentage !== null && (
            <Typography className={styles.percentageText}>
              ({percentage}%)
            </Typography>
          )}
        </Box>
      ) : ( !loading && <Alert severity="warning">Could not display your score.</Alert> )}
      <Box className={styles.buttonContainer}>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Back to Home</Button>
        <Button variant="contained" startIcon={<RateReviewIcon />} onClick={handleReview} disabled={!result}>Review Answers</Button>
        {displayPassStatus === 'fail' && result && (
           <Button variant="contained" color="secondary" startIcon={<ReplayIcon />} onClick={handleRetake}>Retake Quiz</Button>
        )}
      </Box>
      {!result && !loading && <Typography variant="caption" className={styles.loadingReviewText}>Loading detailed review...</Typography>}
    </Paper>
  );
};

export default ResultPage;