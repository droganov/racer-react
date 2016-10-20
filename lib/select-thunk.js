'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _invariant = require('fbjs/lib/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methods = ['get', 'getCopy', 'getDeepCopy'];

var Select = function () {
  function Select(mapSelectToProps, racerModel) {
    var _this = this;

    _classCallCheck(this, Select);

    this.select = function (path, method) {
      (0, _invariant2.default)(typeof path === 'string', 'Argument \'path\' should be a string.');
      return _this.racerModel[method](path);
    };

    this.makeThunk = function (path, method, reactProps) {
      return typeof path === 'function' ? path(_this.thunks(reactProps), reactProps) : _this.select(path, method);
    };

    this.thunks = function (reactProps) {
      return methods.reduce(function (result, method) {
        return _extends({}, result, _defineProperty({}, method, function (path) {
          return _this.makeThunk(path, method, reactProps);
        }));
      }, {});
    };

    this.mapSelectToProps = mapSelectToProps;
    this.racerModel = racerModel;
  }

  _createClass(Select, [{
    key: 'state',
    value: function state(reactProps) {
      return this.mapSelectToProps && this.mapSelectToProps(this.thunks(reactProps), reactProps);
    }
  }]);

  return Select;
}();

exports.default = Select;