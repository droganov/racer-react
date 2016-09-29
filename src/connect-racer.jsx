import React, { Component } from 'react';

import Remote from './query-remote';

const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const remote = new Remote(mapRemoteToProps);

  class RacerReact extends Component {
    static displayName = 'RacerReact';
    static statics = {
      mapRemoteToProps: remote.fetch
    };


    componentDidMount() {
      remote.onCange(this.forceUpdate);
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
