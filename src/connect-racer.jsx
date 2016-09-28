import React, { Component } from 'react';

import QueryStore from './query-store';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


const RacerReactWrapper = (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const queryStore = new QueryStore().use(mapRemoteToProps);

  class RacerReact extends Component {
    static displayName = 'RacerReact';

    static statics = {
      mapRemoteToProps: (racerModel, renderProps) =>
        queryStore.with(racerModel, renderProps)
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
