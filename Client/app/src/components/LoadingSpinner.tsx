import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 10 }}>
    <CircularProgress />
    <Typography sx={{ mt: 2 }}>{text}</Typography>
  </Box>
);

export default LoadingSpinner;