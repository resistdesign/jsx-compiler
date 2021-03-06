import T from 'prop-types';
import React, {Component} from 'react';

export const SUB_APP_NAME = 'SubApp';

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
        <h2>
          {title}
        </h2>
      </div>
    );
  }
}
