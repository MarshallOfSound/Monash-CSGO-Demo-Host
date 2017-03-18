import React, { PropTypes } from 'react';

import { Card, CardActions, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { withRouter } from 'react-router';


class Demo extends React.Component {
  static propTypes = {
    demo: PropTypes.object,
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  _download = () => {
    const fakeLink = document.createElement('a');
    fakeLink.download = true;
    fakeLink.href = this.props.demo.download_url;
    fakeLink.click();
  }

  _navigate = () => {
    this.props.router.push(`/${this.props.demo.id}`);
  }

  _zeroPad(n, len) {
    if (n.toString().length < len) {
      return this._zeroPad(`0${n}`, len);
    }
    return n;
  }

  render() {
    const { demo } = this.props;
    const { division, round, time } = demo;
    const teams = Object.keys(demo.teams).map((teamName) =>
      Object.assign({
        name: teamName,
      }, this.props.demo.teams[teamName])
    );
    if (teams.length < 2) {
      return null;
    }
    const LName = /Unknown Team [0-9]/g.test(teams[0].name) ? demo.CT_teamName : teams[0].name;
    const RName = /Unknown Team [0-9]/g.test(teams[1].name) ? demo.T_teamName : teams[1].name;
    return (
      <div className="demo-card">
        <Card>
          <CardMedia
            overlay={<CardTitle
              title={`${LName} vs ${RName}`}
              subtitle={demo.map.name}
            />}
          >
            <img src={this.props.demo.map.image} role="presentation" />
          </CardMedia>
          <CardText>
            <p>
              {`${this._zeroPad(time.day, 2)}-${this._zeroPad(time.month, 2)}-${time.year} ${this._zeroPad(time.hour, 2)}:${this._zeroPad(time.minutes, 2)}`}
            </p>
            <p>
                Round {round} = Division {division}
            </p>
          </CardText>
          <CardActions>
            <FlatButton label="Details" onClick={this._navigate} />
            <FlatButton label="Download Demo" onClick={this._download} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default withRouter(Demo);
