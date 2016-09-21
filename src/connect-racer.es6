import React, { PropTypes, Component } from 'react';

import QueryHandler from './query-handler.es6';
import DocHandler from './doc-handler.es6';
import ModelGet from './model-get.es6';


export default (mapModelToProps, mapDispatchToProps) => Child => class RacerReact extends Component {
  static displayName = Child.displayName || Child.name || "RacerReact";

  static propTypes = {
    racerModel: React.PropTypes.object,
  };

  static contextTypes = {
    racerModel: React.PropTypes.object.isRequired,
  }

  // react methods
  getInitialState() {
    return {}
  }
  componentWillMount() {
    this.racerModel = this.context.racerModel;

    this.id = "_" + this._reactInternalInstance._mountOrder + "_" + this._reactInternalInstance._mountIndex;
    this.scopedModel = this.racerModel.at( this.id );

    const racerQuery = new QueryHandler(ctx.racerModel, queryObj => {
      // ...
    });

    const racerDoc = new DocHandler(ctx.racerModel, queryObj => {
      // ...
    });

    const modelGet = new ModelGet(ctx.scopedModel);

    this.mapModel = mapModelToProps(racerQuery, racerDoc, modelGet, props);

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
        mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props)
      }
    );
  }
}
