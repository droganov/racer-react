"use strict"

var serverRequire = require("racer/lib/util").serverRequire;

var bundle = serverRequire( module, "./lib/bundle" );
var connectRacer = require( "./lib/connect" );
var connectClient = require( "./lib/connect-client" );
var match = require( "./lib/match" );
var Provider = require( "./lib/provider" );

module.exports = {
  bundle: bundle,
  connectRacer: connectRacer,
  connectClient: connectClient,
  match: match,
  Provider: Provider
}
