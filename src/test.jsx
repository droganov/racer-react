import React, { Component } from 'react';
import { RouterContext, Route, IndexRoute, browserHistory } from "react-router"

import { connectRacer, Provider, match } from "../";

import { renderToStaticMarkup } from 'react-dom/server';

const racerModel = {
  at: () => racerModel,
  get: () => racerModel
};


class App extends Component {
  render() {
    const { test } = this.props;
    return <div>result of =={test}==</div>
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
  console.log(racerModel);
  try {
    console.log(markup(renderProps));
  } catch(e) {
    console.log('render error', e);
  }
});
