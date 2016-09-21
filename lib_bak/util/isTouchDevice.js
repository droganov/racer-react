"use strict"

function isTouchDevice(){
  try {
    document.createEvent( "TouchEvent" );
    return true;
  } catch ( e ){
    return false;
  }
};

module.exports = isTouchDevice;
