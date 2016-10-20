'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _racer = require('racer');

var _racer2 = _interopRequireDefault(_racer);

var _racerRpc = require('racer-rpc');

var _racerRpc2 = _interopRequireDefault(_racerRpc);

var _client = require('racer-transport-koa/lib/client');

var _client2 = _interopRequireDefault(_client);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (bundle, options) {
  var clientOptions = _extends({}, _defaults2.default, options);
  _racer2.default.use(_racerRpc2.default);
  (0, _client2.default)(_racer2.default, clientOptions);
  return _racer2.default.createModel(bundle);
};