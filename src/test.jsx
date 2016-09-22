import React, { Component } from 'react';
import { RouterContext, Route, IndexRoute, browserHistory } from "react-router"

import { connectRacer, Provider, match } from "../";

import { renderToStaticMarkup } from 'react-dom/server';

const racerModel = {
  at: () => ({})
};


class App extends Component {
  render() {
    return <div>result of rendering</div>
  }
}

const mapRemoteToProps = async (query, doc, props) => {
  console.log('mapRemoteToProps');
  try {
    return {
      ...await query("{graphql request1 string}").fetchAs("test"),
      ...await query("{graphql request2 string}").fetchAs("test1"),
      ...await query("{graphql request3 string}").fetchAs("test2")
    }
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
  console.log(markup(renderProps));
});
