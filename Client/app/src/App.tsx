import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import QuizList from "./pages/QuizList";
import Instructions from "./pages/Instructions";
import Login from "./pages/Login";
import Register from "./pages/Register";

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const token = localStorage.getItem("token");
  return (
    <Route
      {...rest}
      render={(props) =>
        token ? <Component {...props} /> : <Redirect to="/login" />
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

        <PrivateRoute exact path="/quizzes" component={QuizList} />
        <PrivateRoute exact path="/instructions/:quizId" component={Instructions} />

        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
