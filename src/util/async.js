module.exports = function( jobs, cb ){
  var done = 0;
  var error;
  var doJob = function( err ){
    if( error ) return;
    if( err ){
      error = err;
      return cb( err );
    }
    done++;
    if( done === jobs.length ) cb();
  }
  for (var i = 0; i < jobs.length; i++) {
    jobs[i]( doJob );
  }
}
