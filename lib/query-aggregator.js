var async = require( "./util/async" );
var proxyScope = require( "./defaults" ).proxyScope;

function QueryAggregator( racerModel ) {
  var queryStack = [];

  this.add = function( component ){
    component.racerQueries = [];
    var query = function( collection, query, fields ){
      var queryObj = arguments.length === 1 ? racerModel.at( collection ) : racerModel.query( collection, query, fields );
      var pushData = function( name, type ){
        var data = {
          query: queryObj,
          name: name,
          type: type
        }
        queryStack.push( data );
        component.racerQueries.push( data );
      }
      return {
        fetchAs: function( name ){
          pushData( name, "fetch" );
          return this;
        },
        subscribeAs: function( name ){
          pushData( name, "subscription" );
          return this;
        },
        // observeAs: function( name ){
        //   pushData( name, "observer" );
        //   return this;
        // },
      }
    }
    component.racer( query );
  }
  this.run = function( cb ){
    var jobs = [];
    var fetchArray = [];
    var subscriptionArray = [];

    for (var i = 0; i < queryStack.length; i++) {
      var item = queryStack[ i ];
      switch ( item.type ) {
        case "subscription":
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
