import React, { Component } from 'react';

import QueryThunk from './query-thunk';
import DocHandler from './doc-handler';
import ModelGet from './model-get';


export default (mapRemoteToProps, mapSelectToProps, mapDispatchToProps) => Child =>
  const queryThunk = new QueryThunk();


  class RacerReact extends Component {
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

      const ctx = this;
      const queryThunk = new QueryThunk(this.racerModel, queryData => {

        // имитация обработки fetch, subscribe, observe
        return new Promise((resolve, reject)=> {
          setTimeout(()=> {
            const qr = 'result of query in connect-racer';
            racerModel.set("_data."+queryData.collection, qr);
            resolve(qr);
            console.log('query '+ queryData.collection + ' resolved ...');
          }, 100+Math.random()*3000);
        });

      });

      const racerDoc = new DocHandler(this.racerModel, queryData => {
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
