import T from 'prop-types';
import React, {Component, ComponentType} from 'react';
import SubApp, {SUB_APP_NAME} from './subfolder/app';

console.log('Loaded app.');

type AppProps = {
  title: string
};
type AppState = {}

export default class App extends Component {
  static propTypes = {
    title: T.string
  };

  constructor(props: AppProps = {}) {
    super(props);
  }

  state: AppState = {};

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
