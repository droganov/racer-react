'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var collection = '$react';
var path = function path(query) {
  return collection + '.' + (0, _objectHash2.default)(query);
};

var Aggregator = function () {
  function Aggregator(racerModel) {
    _classCallCheck(this, Aggregator);

    this.racerModel = racerModel;
  }

  _createClass(Aggregator, [{
    key: 'get',
    value: function get(query) {
      return this.racerModel.get(path(query));
    }
  }, {
    key: 'has',
    value: function has(query) {
      return this.get(query) !== undefined;
    }
  }, {
    key: 'set',
    value: function set(query, result) {
      this.racerModel.set(path(query), result);
    }
  }, {
    key: 'purge',
    value: function purge() {
      // TODO: reset racer collection
    }
  }]);

  return Aggregator;
}();

exports.default = Aggregator;