'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aggregator = require('./aggregator');

var _aggregator2 = _interopRequireDefault(_aggregator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GraphThunk = function GraphThunk(racerModel, sendUpdates) {
  var _this = this;

  _classCallCheck(this, GraphThunk);

  this.validate = function (queryResult) {
    return Object.keys(queryResult).reduce(function (errors, key) {
      return Array.isArray(queryResult[key]) ? errors : [].concat(_toConsumableArray(errors), ['Non-array value received as \'' + key + '\'.']);
    }, []);
  };

  this.apply = function (queryResult, query) {
    var nextQueryResult = {};
    Object.keys(queryResult).forEach(function (key) {
      nextQueryResult[key] = queryResult[key].map(function (snapshot) {
        var doc = _this.racerModel.getOrCreateDoc(key, snapshot.id, snapshot);

        if (doc.shareDoc) {
          doc.shareDoc.data = snapshot.data;
        } else {
          doc.data = snapshot.data;
        }

        doc._updateCollectionData(); // eslint-disable-line no-underscore-dangle

        return doc.get();
      });
    });

    _this.sendUpdates(nextQueryResult);
    if (query) _this.aggregator.set(query, queryResult);
    return nextQueryResult;
  };

  this.dispatch = function (query) {
    return {
      resolve: function resolve(resolver) {
        return _this.aggregator.has(query) ? Promise.resolve(_this.apply(_this.aggregator.get(query))) : new Promise(function (resolve, reject) {
          return _this.racerModel.call('graph', query, function (error, rawQueryResult) {
            if (error) return reject([error]);

            var queryResult = typeof resolver === 'function' ? resolver(rawQueryResult) : rawQueryResult;

            var errors = _this.validate(queryResult);

            return errors.length > 0 ? reject(errors) : resolve(_this.apply(queryResult, query));
          });
        });
      }
    };
  };

  this.thunk = function (reactProps) {
    return function (query) {
      return typeof query === 'function' ? query(_this.thunk(reactProps), reactProps) : _this.dispatch(query);
    };
  };

  this.racerModel = racerModel;
  this.sendUpdates = sendUpdates;
  this.aggregator = new _aggregator2.default(racerModel);
};

exports.default = GraphThunk;