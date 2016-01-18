var React = require( "react" );
var isServer = require( "racer/lib/util" ).isServer;

module.exports = function( Component ){
  // console.log( Component );
  // console.log( typeof Component.statics );
  var componentId = Component.displayName || Component.name || "RacerReactComponent"
  return React.createClass({
    displayName: componentId,
    propTypes:{
      racerModel: React.PropTypes.object
    },
    contextTypes: {
      racerModel: React.PropTypes.object.isRequired
    },
    statics: Object.assign( {}, Component.statics ),
    componentWillMount: function(){
      // console.log(
      //   this.context.racerModel.get("_page")
      // );
      // console.log( this.constructor );
      var stateData = {};

      for (var i = 0; i < this.constructor.racerQueries.length; i++) {
        var item = this.constructor.racerQueries[ i ];
        stateData[ item.name ] = item.queryResult;

        // console.log( item.queryObj.get() );
        if( isServer || item.type === "fetch" ) break;

      }
      this.setState( stateData );




    },
    // subscribe: function( query ){
    //   if( typeof query === "function") var query = query();
    //   console.log( this.props.racerModel );
    // },
    render: function() {
      return React.createElement( Component, Object.assign( {}, this.state, this.props, this.context ) );
    },
  });
}
