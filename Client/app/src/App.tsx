import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate , Switch, Redirect} from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, Typography } from '@mui/material';
import { theme } from './components/theme';
import QuizList from "./pages/QuizList";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import './index.css'; 


import MainLayout from "./pages/MainLayout"; 
import HomeDashboard from "./pages/HomeDashboard"; 
import Performance from "./pages/Performance"; 
import Instructions from "./pages/Instructions";
import Login from "./pages/Login";
import Register from "./pages/Register";

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



const PrivateRoute = ({ component: Component, children, ...rest }: any) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        children ? children : <Component {...props} />
      }
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        <PrivateRoute exact path="/instructions/:quizId" component={Instructions} />

        <PrivateRoute path="/">
          <MainLayout>
            <Switch>
              <Route exact path="/" component={HomeDashboard} />
              <Route path="/quizzes" component={QuizList} />
              <Route path="/performance" component={Performance} />
              <Redirect to="/" /> 
            </Switch>
          </MainLayout>
        </PrivateRoute>
      </Switch>
    </Router>
  );
};

export default App;