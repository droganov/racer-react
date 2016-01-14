"use strict"

var serverRequire = require("racer/lib/util").serverRequire;

var bundle = serverRequire( module, "./src/bundle" );
var Component = require( "./src/component" );
var connectClient = require( "./src/connect-client" );
var match = require( "./src/match" );
var Provider = require( "./src/provider" );

module.exports = {
  bundle: bundle,
  Component: Component,
  connectClient: connectClient,
  match: match,
  Provider: Provider
}
