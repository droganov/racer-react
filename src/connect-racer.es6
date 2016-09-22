import React, { Component } from 'react';

import QueryHandler from './query-handler';
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
    }

    state = {};

    get id() {
      return;
      '_' +
      this._reactInternalInstance._mountOrder +
      '_' +
      this._reactInternalInstance._mountIndex;
    }

    // react methods
    componentWillMount() {
      this.racerModel = this.context.racerModel;

      this.scopedModel = this.racerModel.at(this.id);

      const racerQuery = new QueryHandler(this.racerModel, queryData => {
        // ...
        return new Promise((resolve, reject)=>{
          setTimeout(()=> {
            resolve({[queryData.collection]: 'result of query'});
            console.log('query '+ queryData.collection + ' resolved ...');
          },2000);
        });
      });

      const racerDoc = new DocHandler(this.racerModel, queryObj => {
        // ...
      });

      const modelGet = new ModelGet(this.scopedModel);

      const ctx = this;
      mapRemoteToProps(racerQuery, racerDoc, modelGet).then(mapRemote => {
        ctx.mapRemote = mapRemote;
        console.log('result remote map',mapRemote);
      });
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
          racerModel: this.scopedModel,
          ...mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props),
        }
      );
    }
  };
