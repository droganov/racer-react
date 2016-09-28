import React, { Component } from 'react';

import QueryStore from './query-store';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const remote = new Remote(mapRemoteToProps);

  class RacerReact extends Component {
    static displayName = 'RacerReact';
    static statics = {
      mapRemoteToProps: (racerModel, renderProps) =>
        queryStore.with(racerModel, renderProps)
    };
    componentDidMount() {
      remote.onCange(
        () => this.forceUpdate()
      )
    }

    render() {
      return (
        <Child
          ref="self"
          {...remote.props}
          {...mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props)}
        />
      )
    }
  };

  return RacerReact;
}

export default RacerReactWrapper;
