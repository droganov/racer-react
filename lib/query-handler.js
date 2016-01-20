var type = require( "./query-types" );

function Handler( racerModel, cb ){
  var queryHandler = function( collection, query, fields ){
    var sendQuery = function( name, type ){
      var queryObj = arguments.length === 1 ? racerModel.at( collection ) : racerModel.query( collection, query, fields );
      cb({
        query: queryObj,
        name: name,
        type: type
      });
    }
    return {
      fetchAs: function( name ){
        sendQuery( name, type.FETCH );
        return queryHandler;
      },
      subscribeAs: function( name ){
        sendQuery( name, type.SUBSCRIPTION );
        return queryHandler;
      },
      observeAs: function( name ){
        sendQuery( name, type.OBSERVER );
        return queryHandler;
      },
    }
  };
  return queryHandler;
}

module.exports = Handler;
