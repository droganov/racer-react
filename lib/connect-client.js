"use strict"

var racer = require( "racer" );
var transport = require( "racer-transport-koa/lib/client" );

var defaults = require("./defaults");

function connect( options, bundle ){
  var clientOptions = Object.assign( {}, defaults, options );
  var bundle = bundle || getClientBundle();
  transport( racer, clientOptions );
  var model = racer.createModel( bundle );
  return model;
}

function getClientBundle( id ){
  var bundleData = document.getElementById( id || "racerBundle" );
  return JSON.parse( bundleData.dataset.json );
}

module.exports = connect;
