import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DvrIcon from "@mui/icons-material/Dvr";
import SchoolIcon from "@mui/icons-material/School";
import { fetchStudentStats } from "../api/statsApi";
import "./styles/HomeDashboard.css";

interface StudentStats {
  totalQuizzesAttended: number;
  activeQuizzes: number;
  inactiveQuizzes: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement<React.HTMLAttributes<any>>;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, onClick }) => {
  return (
    <Paper 
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', borderTop: `5px solid ${color}` }}
    >
      <Box className="stat-card-icon" style={{ color }}>
        {React.cloneElement(icon, { style: { color, fontSize: '2rem' } })}
      </Box>
      <Box>
        <Typography variant="h6" className="stat-card-title">{title}</Typography>
        <Typography variant="h3" className="stat-card-value" style={{ color }}>{value}</Typography>
        {subtitle && <Typography variant="body2" className="stat-card-subtitle">{subtitle}</Typography>}
      </Box>
    </Paper>
  );
};

const HomeDashboard: React.FC = () => {
  const history = useHistory();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStudentStats();
        setStats(data);
      } catch (error: unknown) {
        console.error("Failed to load student statistics:", error);
        setStats({ totalQuizzesAttended: 0, activeQuizzes: 0, inactiveQuizzes: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalAttended = stats?.totalQuizzesAttended ?? 0;
  const activeQuizzes = stats?.activeQuizzes ?? 0;
  const inactiveQuizzes = stats?.inactiveQuizzes ?? 0;
  const totalAvailableQuizzes = activeQuizzes + inactiveQuizzes;

  const attemptedPercentage =
    totalAvailableQuizzes > 0
      ? Math.round((totalAttended / totalAvailableQuizzes) * 100)
      : 0;

  const handleActiveClick = () => {
    history.push("/quizzes?status=active");
  };

  const handleInactiveClick = () => {
    history.push("/quizzes?status=inactive");
  };

  if (isLoading) {
    return (
      <Box className="loading-box">
        <CircularProgress size={55} className="loading-spinner" />
        <Typography variant="h6" color="text.secondary">Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-root">
      <Box className="dashboard-header">
        <SchoolIcon className="dashboard-header-icon" />
        <Box>
          <Typography variant="h4" className="dashboard-header-title">Student Dashboard</Typography>
          <Typography className="dashboard-header-subtitle">Welcome back! Here's your quick learning summary.</Typography>
        </Box>
      </Box>

      <Typography variant="h5" className="dashboard-overview-title">Overview</Typography>

      <Box className="stat-cards-container">
        <Box className="card-wrapper">
          <StatCard
            title="Quizzes Attended"
            value={totalAttended}
            icon={<CheckCircleOutlineIcon />}
            color="#2B1871"
            subtitle="Number of quizzes you've attempted"
          />
        </Box>

        <Box className="card-wrapper">
          <StatCard
            title="Active Quizzes"
            value={activeQuizzes}
            icon={<DvrIcon />}
            color="#4CAF50"
            subtitle="Currently open for participation"
            onClick={handleActiveClick}
          />
        </Box>

        <Box className="card-wrapper">
          <StatCard
            title="Inactive Quizzes"
            value={inactiveQuizzes}
            icon={<HourglassEmptyIcon />}
            color="#F44336"
            subtitle="Completed quizzes"
            onClick={handleInactiveClick}
          />
        </Box>

        <Box className="card-wrapper">
          <StatCard
            title="Progress Rate"
            value={attemptedPercentage}
            icon={<CircularProgress variant="determinate" value={attemptedPercentage} style={{ color: '#FF7F47' }} />}
            color="#FF7F47"
            subtitle="Your attempt percentage"
          />
        </Box>
      </Box>

      <Box className="dashboard-footer">
        <Typography variant="body1" color="text.secondary">🌟 Keep going! Every quiz takes you one step closer to mastery.</Typography>
      </Box>
    </Box>
  );
};

export default HomeDashboard;