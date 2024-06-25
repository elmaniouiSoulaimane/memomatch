import {Home} from "./imports"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Component } from "react";
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    return (
      <>
        <ReactNotifications />
        <Router >
            <div id="app">
              <Switch>
                <Route exact path="/">
                  <Home/>
                </Route>
              </Switch>
            </div>
        </Router>
      </>
    )
  }
}

export default App;
