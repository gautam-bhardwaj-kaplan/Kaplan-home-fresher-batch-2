import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Paper, CircularProgress, List, 
    ListItem, ListItemText, Divider, ListItemIcon,
    Grid
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchPerformanceData, type QuizResult } from "../api/statsApi";
import './styles/Performance.css'; 

const ScorePieChart: React.FC<{ title: string; score: number; totalMarks: number }> = ({ title, score, totalMarks }) => {
    const percentage = Math.round((score / totalMarks) * 100);
    const data = [
        { name: 'Score', value: score, color: 'var(--dark-blue)' },
        { name: 'Missed', value: totalMarks - score, color: '#978f8fff' },
    ];

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{
            payload: {
                name: string;
                value: number;
                color: string;
            };
        }>;
    }

    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0].payload;
            return (
                <Paper className="tooltip-paper"> 
                    <Typography 
                        variant="caption" 
                        className="tooltip-text"
                        style={{ color: dataItem.color }} 
                    >
                        {dataItem.name}: {dataItem.value} 
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    return (
        <Paper className="score-pie-card">
            <Typography className="score-pie-card-title">{title}</Typography>
            <Box className="pie-chart-box"> 
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={67}
                            fill="#8884d8"
                            paddingAngle={5}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <Typography className="score-percentage">{percentage}%</Typography>
            </Box>
            <Typography className="score-card-text">Score: {score} / {totalMarks}</Typography>
        </Paper>
    );
};

const Performance: React.FC = () => {
    const [performanceData, setPerformanceData] = useState<QuizResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPerformance = async () => {
            try {
                const data = await fetchPerformanceData();
                setPerformanceData(data);
            } catch (err: unknown) {
                console.error("Failed to load performance data:", err);
                setError("Failed to load performance data. Please ensure you are logged in.");
            } finally {
                setIsLoading(false);
            }
        };
        loadPerformance();
    }, []);

    if (isLoading) {
        return (
            <Box className="loading-box"> 
                <CircularProgress size={50} className="loading-spinner" /> 
            </Box>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;
    if (!performanceData || performanceData.length === 0)
        return (
            <Box>
                <Typography variant="h5" className="performance-title">Performance Overview</Typography>
                <Paper className="empty-data-paper"> 
                    <Typography>You have not attended any quizzes yet.</Typography>
                </Paper>
            </Box>
        );

    const recentQuizzes = performanceData.slice(0, 4);

    return (
        <Box className="performance-container">
            <Typography variant="h5" className="performance-title">Performance Overview</Typography>

            <Typography variant="h6" className="performance-subtitle">Recent Scores</Typography>
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    width: '100%'
                }}>
                    {recentQuizzes.map((quiz, index) => (
                        <Box key={index} sx={{ width: '100%' }}>
                            <ScorePieChart 
                                title={quiz.quizTitle} 
                                score={quiz.score} 
                                totalMarks={quiz.totalMarks} 
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            <Typography variant="h6" className="performance-subtitle">All Attended Quizzes</Typography>
            <Paper className="attended-quiz-list">
                <List>
                    {performanceData.map((quiz, index) => (
                        <React.Fragment key={index}>
                            <ListItem className="attended-quiz-item">
                                <ListItemIcon className="list-item-icon"> 
                                    <CheckCircleOutlineIcon />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={quiz.quizTitle} 
                                    secondary={`Score: ${quiz.score}/${quiz.totalMarks} | Attended on: ${new Date(quiz.submitted_at).toLocaleDateString()}`}
                                />
                                <Typography className={`quiz-score ${quiz.score / quiz.totalMarks >= 0.5 ? 'passed' : 'failed'}`}>
                                    {Math.round((quiz.score / quiz.totalMarks) * 100)}%
                                </Typography>
                            </ListItem>
                            {index < performanceData.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default Performance;