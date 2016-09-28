import React, { Component } from 'react';

import Remote from './query-remote';
import ModelGet from './model-get';


const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const remote = new Remote(mapRemoteToProps);

  class RacerReact extends Component {
    static displayName = 'RacerReact';

    static statics = {
      mapRemoteToProps: (racerModel, renderProps) =>
        remote.with(racerModel, renderProps)
    };

    state = {};

    // react methods
    componentWillMount() {
      this.racerModel = this.context.racerModel;

      this.scopedModel = remote.getScopedModel();

      const modelGet = new ModelGet(this.scopedModel);

    }
    componentDidMount() {}
    componentWillUpdate() {}
    componentWillUnmount() {}

    render() {
      return (
        <Child
          ref="self"
          {...this.props}
          {...this.state}
          racerModel={this.scopedModel}
          {...mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props)}
        />
      )
    }
  };

  return RacerReact;
}

export default RacerReactWrapper;
