import React from 'react';

import CircularProgress from 'material-ui/CircularProgress';

import Demo from './Demo';

export default class DemoList extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      demos: [],
    };
  }

  componentDidMount() {
    fetch(`${window.location.protocol}//${window.location.host}/rest/demos`)
      .then(r => r.json())
      .then(demos => {
        this.setState({
          demos,
        });
      });
  }

  render() {
    if (!this.state.demos.length) {
      return (
        <div>
          <CircularProgress size={2} />
        </div>
      );
    }
    return (
      <div>
        {
          this.state.demos.map((demo) => <Demo key={demo.id} demo={demo} />)
        }
      </div>
    );
  }
}
