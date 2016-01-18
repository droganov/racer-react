"use strict"

module.exports = function( racerModel ){
  return new Promise( function( resolve, reject ){
    racerModel.bundle( function( error, racerBundle ){
      if( error ) return reject( error );
      var json = JSON.stringify( racerBundle );
      resolve( json && json.replace(/<\//g, "<\\/") );
    });
  });
}
