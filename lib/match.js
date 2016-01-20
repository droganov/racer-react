"use strict"
var match = require( "react-router" ).match;
var QueryAggregator = require( "./query-aggregator" );
var isServer = require( "racer/lib/util" ).isServer;

module.exports = function ( options, cb ){
  // TODO: reset модели options.racerModel if !isServer
  match(
    {
      routes: options.routes,
      location: options.location
    },
    function( error, redirectLocation, renderProps ){
      //  errors and redirects
      if( error ) return reject( error );
      if( redirectLocation ) return reject({ location: redirectLocation, status: 301 });

      var queryAggregator = new QueryAggregator( options.racerModel );
      renderProps
        .components
        .filter( function( component ){ return typeof component.racer === "function" } )
        .forEach( function ( component ){ queryAggregator.add( component ) } );

      queryAggregator.run(
        function( err ){
          cb( err, renderProps );
        }
      );
    }
  );
};
