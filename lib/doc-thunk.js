'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('racer/lib/util');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocThunk = function DocThunk(racerModel, sendUpdatesToRemote) {
  _classCallCheck(this, DocThunk);

  _initialiseProps.call(this);

  this.racerModel = racerModel;
  this.sendUpdatesToRemote = sendUpdatesToRemote;

  this.subscribers = [];
  this.observers = [];
  this.listeners = {};

  this.observersIsSubscribed = false;
  this.onScreen = false;
}

// eslint-disable-next-line no-underscore-dangle
;

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.dispatch = function (path, ids) {
    return {
      listen: function listen(target) {
        return _this.makePromise(path, ids, target, false);
      },
      observe: function observe(target) {
        return _this.makePromise(path, ids, target, true).then(_this.checkOnScreen);
      }
    };
  };

  this.thunk = function (reactProps) {
    return function (path, ids) {
      return typeof path === 'function' ? path(_this.thunk(reactProps), reactProps) : _this.dispatch(path, ids);
    };
  };

  this.makePromise = function (path, ids, target, isObserver) {
    var racerModel = _this.racerModel;
    var makeRacerQueries = _this.makeRacerQueries;
    var sendUpdates = _this.sendUpdates;
    var addListeners = _this.addListeners;
    var isLocalQuery = _this.isLocalQuery;


    var targetStorage = _this[isObserver ? 'observers' : 'subscribers'];

    var allRacerQueries = makeRacerQueries(path, ids);
    allRacerQueries.forEach(function (query) {
      return targetStorage.push(query);
    });

    var updatesTrigger = sendUpdates(ids, target, allRacerQueries);
    var queriesResults = updatesTrigger();

    var needSubscribe = !_util.isServer && !isObserver; // на сервере subscribe подменяется на fetch
    var emptyRacerQueries = needSubscribe ? allRacerQueries : allRacerQueries.filter(_this.isEmptyQuery);

    if (emptyRacerQueries.length === 0 || isLocalQuery(allRacerQueries[0])) {
      addListeners(allRacerQueries, updatesTrigger);
      return Promise.resolve(queriesResults);
    }

    return new Promise(function (resolve, reject) {
      racerModel[needSubscribe ? 'subscribe' : 'fetch'](emptyRacerQueries, function (error) {
        if (error) {
          reject(error);
          return;
        }

        addListeners(allRacerQueries, updatesTrigger);
        resolve(updatesTrigger());
      });
    });
  };

  this.isMultiDocs = function (ids) {
    return ids && Array.isArray(ids);
  };

  this.makeRacerQueries = function (path, ids) {
    return _this.isMultiDocs(ids) ? ids.map(function (_id) {
      return _this.racerModel.at(path + '.' + _id);
    }) : [_this.racerModel.at(path)];
  };

  this.isEmptyQuery = function (query) {
    return !query.get();
  };

  this.isLocalQuery = function (query) {
    return query._isLocal(query._at.split('.').shift());
  };

  this.getResults = function (ids, racerQueries) {
    var queryResults = racerQueries.map(function (query) {
      return query.getCopy();
    });
    return _this.isMultiDocs(ids) ? queryResults : queryResults[0];
  };

  this.sendUpdates = function (ids, target, racerQueries) {
    return function () {
      var queryResults = _this.getResults(ids, racerQueries);
      _this.sendUpdatesToRemote(_defineProperty({}, target, queryResults));
      return queryResults;
    };
  };

  this.addListeners = function (racerQueries, updatesTrigger) {
    racerQueries.forEach(function (query) {
      var queryPath = query.path();
      if (_this.listeners[queryPath]) return;
      _this.listeners[queryPath] = query.on('all', '**', updatesTrigger);
    });
  };

  this.removeAllListeners = function () {
    var racerModel = _this.racerModel;

    Object.keys(_this.listeners).forEach(function (queryPath) {
      racerModel.removeListener('all', _this.listeners[queryPath]);
      delete _this.listeners[queryPath];
    });
  };

  this.checkOnScreen = function (data) {
    var onScreen = _this.onScreen;
    var observers = _this.observers;

    if (onScreen === _this.observersIsSubscribed) return data;
    _this.observersIsSubscribed = onScreen;
    _this.setSubscribeState(observers, onScreen);
    return data;
  };

  this.setSubscribeState = function (targets, state) {
    var racerModel = _this.racerModel;
    var isLocalQuery = _this.isLocalQuery;

    var method = state ? 'subscribe' : 'unsubscribe';
    targets.forEach(function (racerQuery) {
      return isLocalQuery(racerQuery) || racerModel[method](racerQuery);
    });
  };

  this.unmount = function () {
    _this.setSubscribeState(_this.observers, false);
    _this.setSubscribeState(_this.subscribers, false);
    _this.removeAllListeners();
  };
};

exports.default = DocThunk;