"use strict"

var type = require( "./query-types" );

function Handler( racerModel, cb ){
  var queryHandler = function( collection, query, fields ){
    var sendQuery = function( name, type ){
      var racerQuery = arguments.length === 1 ? racerModel.at( collection ) : racerModel.query( collection, query, fields );
      cb({
        query: racerQuery,
        name: name,
        type: type
      });
      return racerQuery;
    }
    return {
      fetchAs: function( name ){
        return sendQuery( name, type.FETCH );
      },
      pipeAs: function( name ){
        return sendQuery( name, type.SUBSCRIPTION );
      },
      observeAs: function( name ){
        return sendQuery( name, type.OBSERVER );
      },
    }
  };
  return queryHandler;
}

module.exports = Handler;
