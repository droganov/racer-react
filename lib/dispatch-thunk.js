'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _invariant = require('fbjs/lib/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methods = {
  set: 3,
  del: 2,
  setNull: 3,
  setDiff: 3,
  setDiffDeep: 3,
  setArrayDiff: 3,
  setArrayDiffDeep: 3,
  add: 3,
  setEach: 3,
  increment: 3,
  push: 3,
  unshift: 3,
  insert: 4,
  pop: 2,
  shift: 2,
  remove: 4,
  move: 5,
  stringInsert: 4,
  stringRemove: 4
};

var Dispatch = function Dispatch(mapDispatchToProps, racerModel, sendUpdates) {
  var _this = this;

  _classCallCheck(this, Dispatch);

  this.dispatch = function (methodName) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var path = args[0];
    var _racerModel = _this.racerModel;
    var isLocal = _racerModel._isLocal;
    var method = _racerModel[methodName];


    (0, _invariant2.default)(typeof path === 'string', 'Argument \'path\' should be a string.');
    (0, _invariant2.default)(args.length <= methods[methodName], 'Too much arguments received.');
    (0, _invariant2.default)(args.filter(function (argument) {
      return typeof argument === 'function';
    }).length === 0, 'Callbacks not accepted.');

    var collectionName = path.split('.').shift();

    if (isLocal(collectionName)) {
      _this.sendUpdates();
      return Promise.resolve(method.call.apply(method, [_this.racerModel].concat(args)));
    }

    return new Promise(function (resolve, reject) {
      var result = method.call.apply(method, [_this.racerModel].concat(args, [function (error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
        _this.sendUpdates();
      }]));
    });
  };

  this.makeDispatchThunk = function (reactProps, method) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    return typeof args[0] === 'function' ? args[0](_this.thunks(reactProps), reactProps) : _this.dispatch.apply(_this, [method].concat(args));
  };

  this.thunks = function (reactProps) {
    return Object.keys(methods).reduce(function (result, method) {
      return _extends({}, result, _defineProperty({}, method, function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return _this.makeDispatchThunk.apply(_this, [reactProps, method].concat(args));
      }));
    }, {});
  };

  this.getState = function (reactProps, props) {
    var composedProps = _extends({}, props, reactProps);
    return _extends({}, props, _this.mapDispatchToProps && _this.mapDispatchToProps(_this.thunks(reactProps), composedProps));
  };

  this.mapDispatchToProps = mapDispatchToProps;
  this.racerModel = racerModel;
  this.sendUpdates = sendUpdates;
};

exports.default = Dispatch;