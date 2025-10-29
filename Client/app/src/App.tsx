import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import type { RouteProps, RouteComponentProps } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './components/theme';
import QuizList from "./pages/QuizList";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import MainLayout from "./pages/MainLayout";
import HomeDashboard from "./pages/HomeDashboard";
import Performance from "./pages/Performance";
import Instructions from "./pages/Instructions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoadingSpinner from './components/LoadingSpinner';
import { fetchStudentStats } from './api/statsApi'; 


interface PrivateRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
    
        await fetchStudentStats();
        setIsAuthenticated(true);
      } catch (any) { 
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Switch>
          
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <PrivateRoute exact path="/quiz/:quizId" component={QuizPage} />
          <Route path="/">
            <MainLayout>
              <Switch>
                <PrivateRoute exact path="/" component={HomeDashboard} />
                <PrivateRoute exact path="/quizzes" component={QuizList} />
                <PrivateRoute exact path="/performance" component={Performance} />
                <PrivateRoute exact path="/instructions/:quizId" component={Instructions} />
                <PrivateRoute exact path="/result/:submissionId" component={ResultPage} />
                <Route path="*" component={() => <div>404 Not Found</div>} />
              </Switch>
            </MainLayout>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};
export default App;