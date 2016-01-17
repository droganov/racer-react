"use strict"

var serverRequire = require("racer/lib/util").serverRequire;

var bundle = serverRequire( module, "./src/bundle" );
var Connect = require( "./src/connect" );
var connectClient = require( "./src/connect-client" );
var match = require( "./src/match" );
var Provider = require( "./src/provider" );

module.exports = {
  bundle: bundle,
  Connect: Connect,
  connectClient: connectClient,
  match: match,
  Provider: Provider
}
