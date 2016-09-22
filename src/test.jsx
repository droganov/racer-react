import React, { Component } from 'react';

import {connectRacer, Provider } from "../";

import { renderToStaticMarkup } from 'react-dom/server';



class App extends Component {
  render() {
    return <div>result of rendering</div>
  }
}

const mapRemoteToProps = async (query, doc, props) => ({
  ...await query("{graphql request1 string}").fetchAs("test"),
  ...await query("{graphql request2 string}").fetchAs("test1"),
  ...await query("{graphql request3 string}").fetchAs("test2")
})

const WrappedApp = connectRacer(mapRemoteToProps, null, null)(App);


function markup() {
  return renderToStaticMarkup(
    <Provider racerModel={{
        at: () => ({})
      }}
    >
      <WrappedApp />
    </Provider>
  );
}

console.log(markup());
