import React, { Component } from 'react';

import QueryThunk from './query-thunk';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


export default (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child => {
  const queryThunk = new QueryThunk();

  return class RacerReact extends Component {
    static displayName = 'RacerReact';

    static statics = {
      mapRemoteToProps: racerModel => {
        return queryThunk
          .use(mapRemoteToProps)
          .with(racerModel);
      },
    };

    state = {};

    get id() {
      return `
        _${this._reactInternalInstance._mountOrder}
        _${this._reactInternalInstance._mountIndex}
      `;
    }

    // react methods
    componentWillMount() {
      this.racerModel = this.context.racerModel;

      this.scopedModel = this.racerModel.at(this.id);

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
}
