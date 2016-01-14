"use strict"

var Component = require( "./src/component" );
var connectClient = require( "./src/connect-client" );
var match = require( "./src/match" );
var Provider = require( "./src/provider" );

module.exports = {
  Component: Component,
  connectClient: connectClient,
  match: match,
  Provider: Provider
}
