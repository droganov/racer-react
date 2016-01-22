"use strict"

var match = require( "react-router" ).match;
var QueryAggregator = require( "./query-aggregator" );
var isServer = require( "racer/lib/util" ).isServer;

module.exports = function ( options, cb ){
  var racerModel = options.racerModel;
  if( !isServer ){
    racerModel.destroy && racerModel.destroy( "_page" );
    racerModel.unloadAll && racerModel.unloadAll();
  }
  match(
    {
      routes: options.routes,
      location: options.location
    },
    function( error, redirectLocation, renderProps ){
      //  errors and redirects
      if( error ) return reject( error );
      if( redirectLocation ) return reject({ location: redirectLocation, status: 301 });

      var queryAggregator = new QueryAggregator( racerModel );

      for (var i = 0; i < renderProps.components.length; i++) {
        var component = renderProps.components[ i ];
        if( typeof component.racer === "function" ) queryAggregator.use( component );
      }

      queryAggregator.run(
        function( err ){
          cb( err, renderProps );
        }
      );
    }
  );
};
