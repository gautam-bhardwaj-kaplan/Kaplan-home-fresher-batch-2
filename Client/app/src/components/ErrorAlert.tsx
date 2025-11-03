import React from 'react';
import { Alert } from '@mui/material';

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <Alert severity="error" sx={{ mt: 4 }}>{message}</Alert>
);

export default ErrorAlert;