// src/components/QuestionPalette.tsx
import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import styles from './style/QuestionPalette.module.css';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: Set<number>;
  markedForReview: Set<number>;
  onQuestionSelect: (index: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  markedForReview,
  onQuestionSelect,
}) => {
  return (
    <Paper elevation={4} className={styles.palettePaper}>
      <Box className={styles.legend}>
        <Typography variant="h6" className={styles.legendTitle}>Legend</Typography>
        <Box className={styles.legendItem}>
          <Box className={`${styles.legendColorBox} ${styles.answeredBox}`} />
          <Typography variant="body2">Answered</Typography>
        </Box>
        <Box className={styles.legendItem}>
          <Box className={`${styles.legendColorBox} ${styles.markedBox}`} />
          <Typography variant="body2">Marked for Review</Typography>
        </Box>
        <Box className={styles.legendItem}>
          <Box className={`${styles.legendColorBox} ${styles.unansweredBox}`} />
          <Typography variant="body2">Unanswered</Typography>
        </Box>
      </Box>

      <Typography variant="h6" className={styles.paletteTitle}>Questions</Typography>
      <Grid container spacing={1.5} className={styles.questionGrid}>
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isAnswered = answeredQuestions.has(index);
          const isMarked = markedForReview.has(index);
          const isCurrent = index === currentQuestionIndex;

          let buttonClass = styles.questionButton;
          if (isMarked) {
            buttonClass += ` ${styles.marked}`;
          } else if (isAnswered) {
            buttonClass += ` ${styles.answered}`;
          }
          if (isCurrent) {
            buttonClass += ` ${styles.current}`;
          }

          // This is the corrected return statement
          return (
            <Grid item xs={3} key={index}>
              <Button
                variant="outlined"
                className={buttonClass}
                onClick={() => onQuestionSelect(index)}
              >
                {index + 1}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default QuestionPalette;