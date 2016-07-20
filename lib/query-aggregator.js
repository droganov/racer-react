"use strict"

var async = require( "./util/async" );
var proxyScope = require( "./defaults" ).proxyScope;
var QueryHandler = require( "./query-handler" );
var type = require( "./query-types" );

function QueryAggregator( racerModel, renderProps, reduxStore ) {
  var queryStack = [];

  this.use = function( component ){
    component.racerQueries = [];
    var queryHandler = new QueryHandler( racerModel, function( queryObj ){
      queryStack.push( queryObj );
      component.racerQueries.push( queryObj );
    });
    component.racer( queryHandler, renderProps, reduxStore );
  }
  this.run = function( cb ){
    var jobs = [];
    var fetchArray = [];
    var subscriptionArray = [];

    for (var i = 0; i < queryStack.length; i++) {
      var item = queryStack[ i ];
      switch ( item.type ) {
        case type.SUBSCRIPTION:
          subscriptionArray.push( item.query );
          break;
        default:
          fetchArray.push( item.query );
      }
    }
    if( fetchArray.length ){
      jobs.push(
        function( cb ){
          racerModel.fetch( fetchArray, cb );
        }
      );
    }
    if( subscriptionArray.length ){
      jobs.push(
        function( cb ){
          racerModel.subscribe( subscriptionArray, cb );
        }
      );
    }
    async( jobs, cb );
  }
};



module.exports = QueryAggregator;
