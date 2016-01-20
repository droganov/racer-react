function Handler( racerModel, cb ){
  return function( collection, query, fields ){
    var sendQuery = function( name, type ){
      var queryObj = arguments.length === 1 ? racerModel.at( collection ) : racerModel.query( collection, query, fields );
      cb({
        query: queryObj,
        name: name,
        type: type
      });
    }
    return {
      fetchAs: function( name ){
        sendQuery( name, "fetch" );
        return this;
      },
      subscribeAs: function( name ){
        sendQuery( name, "subscription" );
        return this;
      },
      observeAs: function( name ){
        sendQuery( name, "observer" );
        return this;
      },
    }
  }
}

module.exports = Handler;
