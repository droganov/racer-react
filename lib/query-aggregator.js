var async = require( "./util/async" );

function QueryAggregator( racerModel ) {
  var fetches = {
    queries: [],
    names: [],
    components: []
  }
  var subscriptions = {
    queries: [],
    names: [],
    components: []
  }
  var queries = [];

  this.add = function( component ){
    component.racerQueries = [];
    var query = function( collection, query, fields ){
      var queryObj = arguments.length === 1 ? racerModel.at( collection ) : racerModel.query( collection, query, fields );
      return {
        fetchAs: function( name ){
          fetches.queries.push( queryObj );
          fetches.names.push( name );
          fetches.components.push( component );
        },
        watchAs: function( name ){
          subscriptions.queries.push( queryObj );
          subscriptions.names.push( name );
          subscriptions.components.push( component );
        },
      }
    }
    component.racer( query );
  }
  this.run = function( cb ){
    var jobs = [];
    var fetchArray = [];
    var subscriptionArray = [];

    fetches.queries.forEach( function( query ){
      // console.log( query );
      fetchArray.push( query );
    });
    subscriptions.queries.forEach( function( query ){
      fetchArray.push( query );
    });

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
    async( jobs, function( err ){
      if( err ) return cb( cb );
      racerModel.set("_page.test", "piu");
      fetchArray.forEach( function( queryObj, i ){
        var component = fetches.components[ i ];
        component.racerQueries.push({
          name: fetches.names[ i ],
          type: "fetch",
          queryResult: queryObj.get(),
          queryObj: queryObj
        });
      });
      subscriptionArray.forEach( function( queryObj, i ){
        var component = subscriptions.components[ i ];
        component.racerQueries.push({
          name: subscriptions.names[ i ],
          type: "subscription",
          queryResult: queryObj.get(),
          queryObj: queryObj
        })
      });
      cb();
    } );
  }
};



module.exports = QueryAggregator;
