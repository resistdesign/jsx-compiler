import T from 'prop-types';
import React, {Component} from 'react';
import SubApp, {SUB_APP_NAME} from './subfolder/app';

console.log('Loaded app.');

export default class App extends Component {
  static propTypes = {
    title: T.string
  };

  constructor(props = {}) {
    super(props);
  }

  async funcA() {
  }

  funcB = async () => {
  };

  render() {
    const {
      title = 'App'
    } = this.props;

    return (
      <div
        onClick={this.funcA}
        onKeyUp={this.funcB}
      >
        <h1>
          {title}
        </h1>
        <SubApp
          title={`${title} - ${SUB_APP_NAME}`}
        />
      </div>
    );
  }
}
