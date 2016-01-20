var React = require( "react" );
var isServer = require( "racer/lib/util" ).isServer;
var QueryHandler = require( "./query-handler" );
var type = require( "./query-types" );

module.exports = function( Component ){
  return React.createClass({
    displayName: Component.displayName || Component.name || "RacerReactComponent",
    propTypes:{ racerModel: React.PropTypes.object },
    contextTypes: { racerModel: React.PropTypes.object.isRequired },
    statics: Component.statics,
    activeEventEmitters: [],

    addSubscriber: function( queryObj ){
      var query = queryObj.query;
      var model = query.model;
      var self = this;
      model.on( "all", "$queries." + query.hash + ".**", function(){
        var state = {};
        state[ queryObj.name ] = query.get();
        self.setState( state );
      });
      this.activeEventEmitters.push( model );
    },
    removeSubcriber: function( query ){
      query.removeAllListeners();
      var i = this.activeEventEmitters.indexOf( query );
      if( i > -1 ) this.activeEventEmitters.splice( i, 1 );
    },

    componentWillMount: function(){
      var newState = {};
      var racerModel = this.context.racerModel;
      var ctx = this;
      for (var i = 0; i < this.constructor.racerQueries.length; i++) {
        var queryObj = this.constructor.racerQueries[ i ];
        newState[ queryObj.name ] = queryObj.query.get();

        if( isServer || queryObj.type === "fetch" ) continue;
        this.addSubscriber( queryObj );
      }
      this.setState( newState );

      Component.prototype.racerQuery = new QueryHandler( racerModel, function( queryObj ){
        var query = queryObj.query;
        var name = queryObj.name;
        var state = {};
        var cb = function(){
          state[ name ] = query.get();
          ctx.setState( state );
          switch ( queryObj.type ) {
            case type.SUBSCRIPTION:
              ctx.addSubscriber( queryObj );
              break;
          }
        }
        queryObj.type === type.SUBSCRIPTION ? query.subscribe( cb ) : query.fetch( cb );
      });
    },

    componentWillUnmount: function(){
      for (var i = 0; i < this.activeEventEmitters.length; i++) {
        this.removeSubcriber( this.activeEventEmitters[ i ] );
      }
    },


    render: function() {
      return React.createElement( Component, Object.assign( { ref: "self" }, this.state, this.props, this.context ) );
    },
  });
}
