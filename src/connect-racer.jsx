import React, { Component } from 'react';

import Remote from './query-remote';

const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const remote = new Remote(mapRemoteToProps);

  class RacerReact extends Component {
    static displayName = 'RacerReact';
    static statics = {
      mapRemoteToProps: remote.fetch
    };

    isOnscreen() {
      const domNode = findDOMNode(this.refs.self);
      const windowTop = document.body.scrollTop;
      const windowBottom = windowTop + window.innerHeight;
      const elementTop = domNode.offsetTop;
      const elementBottom = elementTop + domNode.offsetHeight;

      return !(( windowBottom < elementTop) || (windowTop > elementBottom));
    }

    checkOnscreen() {
      const isOnscreen = this.isOnscreen();
      if( isOnscreen === this.wasOnscreen ) return;
      isOnscreen ? remote.subscribeObservers() : remote.unsubscribeObservers()
      this.wasOnscreen = isOnscreen;
    }

    componentWillMount() {
      this.wasOnscreen = false;
    }

    componentDidMount() {
      remote.onCange(this.forceUpdate);
      window.addEventListener( "scroll", this.checkOnscreen );
    }

    componentWillUnmount() {
      window.removeEventListener( "scroll", this.checkOnscreen );
    }

    render() {
      return (
        <Child
          ref="self"
          {...remote.props()}
          {...mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props)}
        />
      )
    }
  };

  return RacerReact;
}

export default RacerReactWrapper;
