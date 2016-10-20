'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactRouter = require('react-router');

var _util = require('racer/lib/util');

exports.default = function (options, cb) {
  var racerModel = options.racerModel;


  if (!_util.isServer) {
    var silentModel = racerModel.silent();
    silentModel.destroy && silentModel.destroy('_page');
    silentModel.unloadAll && silentModel.unloadAll();
  }

  (0, _reactRouter.match)(options, function (err, redirectLocation, renderProps) {
    //  errors and redirects
    if (err || redirectLocation || !renderProps) {
      cb(err, redirectLocation);
      return;
    }

    Promise.all(renderProps.components.filter(function (component) {
      return component && component.statics && typeof component.statics.mapRemoteToProps === 'function';
    }).map(function (Component) {
      return Component.statics.mapRemoteToProps(racerModel, renderProps);
    })).catch(cb).then(function () {
      return cb(null, null, renderProps);
    });
  });
};