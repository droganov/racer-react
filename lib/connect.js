"use strict"

var React = require( "react" );
var isServer = require( "racer/lib/util" ).isServer;
var findDOMNode = require( "react-dom" ).findDOMNode;

var QueryHandler = require( "./query-handler" );
var type = require( "./query-types" );
var isTouchDevice = require( "./util/isTouchDevice" );

module.exports = function( Component ){
  return React.createClass({
    displayName: Component.displayName || Component.name || "RacerReactComponent",
    propTypes:{ racerModel: React.PropTypes.object },
    contextTypes: { racerModel: React.PropTypes.object.isRequired },
    statics: Component.statics,

    activeEventEmitters: [],
    observers: [],

    // component methods
    connectChargedQuery: function( queryObj ){
      var queryData = queryObj.query.get();
      if( isServer ) return queryData;
      switch ( queryObj.type ) {
        case type.SUBSCRIPTION:
          this.addSubscriber( queryObj );
          break;
        case type.OBSERVER:
          this.addObserver( queryObj );
          break;
      }
      return queryData;
    },

    addObserver: function( queryObj ){
      this.observers.push( queryObj );
      if( this.state.isOnscreen ) this.enableObserver( queryObj );
    },
    enableObserver: function( queryObj ){
      queryObj.query.subscribe();
      this.addSubscriber( queryObj );
    },
    enableAllObservers: function(){
      for (var i = 0; i < this.observers.length; i++){
        this.enableObserver( this.observers[ i ] );
      }
    },
    disableObservers: function(){
      for (var i = 0; i < this.observers.length; i++){
        var observer = this.observers[ i ].query;
        observer.unsubscribe();
        this.removeSubcriber( observer );
      }
    },

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

    isOnscreen: function(){
      var domNode = this.domNode;
      return ( domNode.offsetTop + domNode.offsetHeight ) > document.body.scrollTop;
    },

    handleQueries: function( handler ){
      for (var i = 0; i < this.constructor.racerQueries.length; i++) {
        handler( this.constructor.racerQueries[ i ] );
      }
    },

    checkOnscreen: function( ev ){
      var isOnscreen = this.isOnscreen();
      if( isOnscreen === this.state.isOnscreen ) return;
      isOnscreen ? this.enableAllObservers() : disableObservers();
      this.setState({
        isOnscreen: isOnscreen
      });
    },

    // react methods
    getInitialState: function(){
       return {
         isOnscreen: false
       }
    },

    componentWillMount: function(){
      var newState = {};
      var racerModel = this.context.racerModel;
      var ctx = this;

      this.handleQueries( function( queryObj ){
        newState[ queryObj.name ] = ctx.connectChargedQuery( queryObj );
      });
      this.setState( newState );

      Component.prototype.racerQuery = new QueryHandler( racerModel, function( queryObj ){
        var query = queryObj.query;
        var state = {};
        var cb = function(){
          state[ queryObj.name ] = ctx.connectChargedQuery( queryObj );
          ctx.setState( state );
        }
        queryObj.type === type.SUBSCRIPTION ? query.subscribe( cb ) : query.fetch( cb );
      });
    },

    componentDidMount: function(){
      var self = this;
      this.domNode = findDOMNode( this );
      // if( this.isOnscreen() ) this.enableAllObservers();
      this.checkOnscreen();
      window.addEventListener( "scroll", this.checkOnscreen );
      if( isTouchDevice() ) window.addEventListener( "touchmove", this.checkOnscreen );
    },

    componentWillUnmount: function(){
      for (var i = 0; i < this.activeEventEmitters.length; i++) {
        this.removeSubcriber( this.activeEventEmitters[ i ] );
      }
      window.removeEventListener( "scroll", this.checkOnscreen );
      window.removeEventListener( "touchmove", this.checkOnscreen );
    },

    render: function() {
      return React.createElement( Component, Object.assign( {}, this.state, this.props, this.context ) );
    },
  });
}
