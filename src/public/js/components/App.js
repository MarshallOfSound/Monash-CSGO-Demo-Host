import React from 'react';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Router, Route, hashHistory } from 'react-router';

import Demo from './Demo';
import DemoList from './DemoList';

export default class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Router history={hashHistory}>
          <Route path="/" component={DemoList} />
          <Route path="/:demoID" component={DemoList} />
        </Router>
      </MuiThemeProvider>
    );
  }
}
