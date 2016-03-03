"use strict"

var racer = require( "racer" );
var transport = require( "racer-transport-koa/lib/client" );

var defaults = require("./defaults");

function connect( bundle, options ){
  var clientOptions = Object.assign( {}, defaults, options );
  transport( racer, clientOptions );
  var model = racer.createModel( bundle );
  return model;
}

module.exports = connect;
