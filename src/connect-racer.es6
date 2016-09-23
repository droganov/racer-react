import React, { Component } from 'react';

import QueryThunk from './query-thunk';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


export default (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child =>
  class RacerReact extends Component {
    static displayName = 'RacerReact';

    static propTypes = {
      racerModel: React.PropTypes.object,
    };

    static contextTypes = {
      racerModel: React.PropTypes.object.isRequired,
    };

    static statics = {
      mapRemoteToProps,
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

      const ctx = this;
      const queryThunk = new QueryThunk(this.racerModel, queryData => {

        // имитация обработки fetch, subscribe, observe
        return new Promise((resolve, reject)=> {
          setTimeout(()=> {
            const qr = {[queryData.collection]: 'result of query'};
            Object.assign(ctx.racerModel, qr);
            resolve(qr);
            console.log('query '+ queryData.collection + ' resolved ...');
          }, 100+Math.random()*3000);
        });

      });

      const racerDoc = new DocHandler(this.racerModel, queryObj => {
        // ...
      });

      const modelGet = new ModelGet(this.scopedModel);

    }
    componentDidMount() {}
    componentWillUpdate() {}
    componentWillUnmount() {}

    render() {
      return React.createElement(
        Child,
        {
          ref: 'self',
          ...this.props,
          ...this.state,
          ...this.scopedModel.get(), // временно
          racerModel: this.scopedModel,
          ...mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props),
        }
      );
    }
  };
