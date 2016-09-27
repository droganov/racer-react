import originalRacer from 'racer';

import React, { Component } from 'react';
import { RouterContext, Route, IndexRoute, browserHistory } from "react-router"

import racerReact, { connectRacer, Provider, match } from "../";

import { renderToStaticMarkup } from 'react-dom/server';

originalRacer.Model.prototype.graphQlQuery = (graphQlRequest) => {
  console.log('graphQlQuery function in test', graphQlRequest);
  return {
    graphQlRequest,
  };
}

const racerModel = originalRacer.createModel();


class App extends Component {
  componentWillMount() {
    // this.props.racerModel.graphQlQuery(11);
  }
  render() {
    // const test = this.props.racerModel.get("test");
    return <div>result of ====</div>
  }
}

const mapRemoteToProps = async (query, doc, props) => {

  try {
    const rs = await Promise.all([
      query("{graphql request1 string}").fetchAs("test"),
      query("{graphql request2 string}").fetchAs("test1"),
      query("{graphql request3 string}").fetchAs("test2")
    ]);
    return { ...rs[0], ...rs[1], ...rs[2] };
  } catch (e) {
    console.log(e);
  }

  return {};
}

const WrappedApp = connectRacer(mapRemoteToProps, null, null)(App);

const routes =
  <Route path="/">
    <IndexRoute component={WrappedApp} />
  </Route>;

function markup(renderProps) {
  return renderToStaticMarkup(
    <Provider racerModel={racerModel} >
      <RouterContext {...renderProps} />
    </Provider>
  );
}

match({ racerModel, routes, location: '/' }, (err, redirectLocation, renderProps) => {
  // console.log(racerModel.get());
  try {
    console.log(markup(renderProps));
  } catch(e) {
    console.log('render error', e);
  }
});
