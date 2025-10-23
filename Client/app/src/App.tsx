import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import MainLayout from "./pages/MainLayout"; 
import HomeDashboard from "./pages/HomeDashboard"; 
import Performance from "./pages/Performance"; 
import QuizList from "./pages/QuizList"; 

import Instructions from "./pages/Instructions";
import Login from "./pages/Login";
import Register from "./pages/Register";

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