var React = require( "react" );
var isServer = require( "racer/lib/util" ).isServer;

module.exports = function( Component ){
  return React.createClass({
    displayName: Component.displayName || Component.name || "RacerReactComponent",
    propTypes:{
      racerModel: React.PropTypes.object
    },
    contextTypes: {
      racerModel: React.PropTypes.object.isRequired
    },
    statics: Component.statics,

    activeEventEmitters: [],

    addSubscriber: function( query, handler ){
      query.model.on( "all", "$queries." + query.hash + ".**", handler );
      this.activeEventEmitters.push( query.model );
    },

    componentWillMount: function(){
      var stateData = {};
      var racerModel = this.context.racerModel;
      var ctx = this;
      for (var i = 0; i < this.constructor.racerQueries.length; i++) {
        var item = this.constructor.racerQueries[ i ];
        stateData[ item.name ] = item.query.get();

        if( isServer || item.type === "fetch" ) continue;

        this.addSubscriber( item.query, function( operation, data ){
          var state = {};
          state[ item.name ] = item.query.get();
          ctx.setState( state );
        });
      }
      this.setState( stateData );
    },

    componentWillUnmount: function(){
      for (var i = 0; i < this.activeEventEmitters.length; i++) {
        this.activeEventEmitters[ i ].removeAllListeners();
      }
    },


    render: function() {
      return React.createElement( Component, Object.assign( { ref: "self" }, this.state, this.props, this.context ) );
    },
  });
}
