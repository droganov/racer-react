'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (racerModel, reactProps, sendUpdates) {
  var dispatch = function dispatch() {
    for (var _len = arguments.length, queryArgs = Array(_len), _key = 0; _key < _len; _key++) {
      queryArgs[_key] = arguments[_key];
    }

    return {
      fetchAs: function fetchAs(target) {
        return new Promise(function (resolve, reject) {
          var racerQuery = racerModel.query.apply(racerModel, queryArgs);

          racerQuery.fetch(function (error) {
            if (error) {
              reject(error);
              return;
            }

            var rawQueryResult = racerQuery.getExtra() || racerQuery.get();

            var queryResult = _defineProperty({}, target, rawQueryResult);

            sendUpdates(queryResult);
            resolve(queryResult);
          });
        });
      }
    };
  };

  var thunk = function thunk() {
    for (var _len2 = arguments.length, queryArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      queryArgs[_key2] = arguments[_key2];
    }

    return typeof queryArgs[0] === 'function' ? thunk(queryArgs[0](reactProps)) : dispatch.apply(undefined, queryArgs);
  };

  return thunk;
};

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }