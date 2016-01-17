var React = require( "react" );

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
      var stateData = {};
      this
        .constructor
        .racerQueries
        .forEach( function( item ){
          stateData[ item.name ] = item.queryResult;
        });
      console.log( stateData );
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
