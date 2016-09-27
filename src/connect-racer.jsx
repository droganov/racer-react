import React, { Component } from 'react';

import QueryThunk from './query-thunk';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const queryThunk = new QueryThunk();

  class RacerReact extends Component {
    static displayName = 'RacerReact';

    static statics = {
      mapRemoteToProps: racerModel => queryThunk
        .use(mapRemoteToProps)
        .with(racerModel),
    };

    state = {};

    // react methods
    componentWillMount() {
      this.racerModel = this.context.racerModel;

      this.scopedModel = queryThunk.getScopedModel();

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
