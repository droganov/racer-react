"use strict"

var match = require( "react-router" ).match;
var QueryAggregator = require( "./query-aggregator" );
var isServer = require( "racer/lib/util" ).isServer;

module.exports = function ( options, cb ){
  var racerModel = options.racerModel;
  if( !isServer ){
    var silentModel = racerModel.silent();
    silentModel.destroy && silentModel.destroy( "_page" );
    silentModel.unloadAll && silentModel.unloadAll();
  }
  match(
    {
      routes: options.routes,
      location: options.location
    },
    function( err, redirectLocation, renderProps ){
      //  errors and redirects
      if( err || redirectLocation || !renderProps ) return cb( err, redirectLocation );

      var queryAggregator = new QueryAggregator( racerModel, renderProps );
      for (var i = 0; i < renderProps.components.length; i++) {
        var component = renderProps.components[ i ];
        if( component && ( typeof component.racer === "function" ) ) queryAggregator.use( component );
      }

      queryAggregator.run(
        function( err ){
          cb( err, null, renderProps );
        }
      );
    }
  );
};
