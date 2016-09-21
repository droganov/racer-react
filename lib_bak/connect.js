"use strict";

var React = require( "react" );
var isServer = require( "racer/lib/util" ).isServer;
var findDOMNode = require( "react-dom" ).findDOMNode;

var QueryHandler = require( "./query-handler" );
var type = require( "./query-types" );
var isTouchDevice = require( "./util/isTouchDevice" );

module.exports = function( mapRacerToProps, mapDispatchToProps ) {
  return function(Child) {
    return React.createClass({
      displayName: Child.displayName || Child.name || "RacerReact",
      propTypes:{ racerModel: React.PropTypes.object },
      contextTypes: { racerModel: React.PropTypes.object.isRequired },
      statics: {
        /*
          racer для пререндера
          queryHandler - объект сборщика query в контексте QueryAggregator
          renderProps - данные от react-router
          reduxStore - хранилище от ридакса
          racerModel - рутовая модель рейсера
        */
        racer: function(queryHandler, renderProps, reduxStore, racerModel) {
          function staticDispatch(action) {
            return action(racerModel, queryHandler);
          }
          mapRacerToProps && mapRacerToProps(staticDispatch, renderProps, reduxStore);
        },
      },

      // query methods
      queryMount: function( queryObj ){
        var query = queryObj.query;
        var projectionPath = this.projectionComputePath( queryObj.name );

        if(typeof query._at == "undefined") { // Query
          this.queryHasExtra( query ) ? query.refExtra( projectionPath ) : query.ref( projectionPath );
        } else { // scoped model
          query.root.ref(projectionPath, query);
        }
        this.queries[queryObj.name] = queryObj;

        if( isServer ) return;
        if( queryObj.type === type.OBSERVER ) this.queryRegisterAsObserver( queryObj );
      },
      queryHasExtra: function( query ){ return typeof query.getExtra() !== "undefined" },
      queryRegisterAsObserver: function( queryObj ){
        this.observers.push( queryObj );
        if( this.state.isOnscreen ) this.queryStartObserving( queryObj );
      },
      queryStartObserving: function( queryObj ){
        queryObj.query.subscribe();
      },
      queryStartAllObservers: function(){
        for (var i = 0; i < this.observers.length; i++){
          this.queryStartObserving( this.observers[ i ] );
        }
      },
      queryStopAllObservers: function(){
        for (var i = 0; i < this.observers.length; i++){
          var observer = this.observers[ i ].query;
          observer.unsubscribe();
        }
      },

      // projection methods
      projectionComputePath: function( name ){ return ( this.id + "." + name ) },
      projectionGetData: function(){
        return this.scopedModel.get();
      },
      projectionResloveUpdate: function( newProps ){
        const newPropsForApply = typeof newProps !== "string" ? newProps : {};
        var newState = Object.assign( {}, this.projectionGetData(), newPropsForApply );

        for ( var key in newState ) {
          var item = newState[ key ];
          // if ( !Array.isArray( item ) ) { continue; }
          if ( this.state[ key ] === item || !Array.isArray( item ) ) { continue; }
          newState[ key ] = item.filter(
            function( el ){
              return typeof el !== "undefined";
            }
          );
        }
        this.wrappeePassProps( newState );
      },

      // component methods
      wrappeeResolveQueries: function( handler ){
        var racerQueries = this.constructor.racerQueries || [];
        for (var i = 0; i < racerQueries.length; i++) {
          this.queryMount( racerQueries[ i ] );
        }
      },
      wrappeePassProps: function( newProps ){
        var newState = Object.assign( {}, this.projectionGetData(), newProps );
        this.setState( newState );
      },

      // getRe
      isOnscreen: function(){
        // var domNode = this.domNode;
        var domNode = findDOMNode(this.refs.self);
        var windowTop = document.body.scrollTop;
        var windowBottom = windowTop + window.innerHeight;
        var elementTop = domNode.offsetTop;
        var elementBottom = elementTop + domNode.offsetHeight;

        return !(( windowBottom < elementTop) || (windowTop > elementBottom));
      },
      checkOnscreen: function( ev ){
        var isOnscreen = this.isOnscreen();
        if( isOnscreen === this.wasOnscreen ) return;
        isOnscreen ? this.queryStartAllObservers() : this.queryStopAllObservers();
        this.wasOnscreen = isOnscreen;
      },

      dispatch: function(action) {
        return action(this.scopedModel, this.state.racerQuery);
      },

      // react methods
      getInitialState: function(){
        return {}
      },
      componentWillMount: function(){
        this.racerModel = this.context.racerModel;
        this.queries = {};
        this.observers = [];
        this.wasOnscreen = false;
        this.id = "_" + this._reactInternalInstance._mountOrder + "_" + this._reactInternalInstance._mountIndex;
        this.scopedModel = this.racerModel.at( this.id );
        this.wrappeeResolveQueries();

        var ctx = this;
        var racerQuery = new QueryHandler( ctx.racerModel, function( queryObj ){
          var query = queryObj.query;
          var cb = function(){
            ctx.queryMount( queryObj );
          }
          queryObj.type === type.SUBSCRIPTION ? query.subscribe( cb ) : query.fetch( cb );
        });
        ctx.projectionResloveUpdate({
          racerQuery: racerQuery,
        });
        ctx.scopedModel.on( "all", "**", ctx.projectionResloveUpdate );
      },
      componentDidMount: function(){
        this.checkOnscreen();
        window.addEventListener( "scroll", this.checkOnscreen );
        if( isTouchDevice() ) window.addEventListener( "touchmove", this.checkOnscreen );

      },
      componentWillUpdate: function (){
        if (this.constructor.queryAggregatorUpdate) {
          delete this.constructor.queryAggregatorUpdate;
          this.wrappeeResolveQueries();
        }
      },
      componentWillUnmount: function(){
        window.removeEventListener( "scroll", this.checkOnscreen );
        if( isTouchDevice() ) window.removeEventListener( "touchmove", this.checkOnscreen );
        this.scopedModel.removeAllListeners();

        var silentModel = this.racerModel.silent();
        silentModel.destroy && silentModel.destroy( this.id );
      },

      render: function() {
        return React.createElement(
          Child,
          Object.assign(
            { ref: "self" },
            this.props,
            this.state,
            { racerModel: this.scopedModel },
            mapDispatchToProps && mapDispatchToProps(this.dispatch, this.props)
          )
        );
      },
    });
  }
}