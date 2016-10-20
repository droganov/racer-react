'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graphThunk = require('./graph-thunk');

var _graphThunk2 = _interopRequireDefault(_graphThunk);

var _docThunk = require('./doc-thunk');

var _docThunk2 = _interopRequireDefault(_docThunk);

var _selectThunk = require('./select-thunk');

var _selectThunk2 = _interopRequireDefault(_selectThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Remote = function () {
  function Remote(mapRemoteToProps, racerModel) {
    var _this = this;

    _classCallCheck(this, Remote);

    this.receiveUpdates = function (updates) {
      _this.remoteState = _extends({}, _this.remoteState, updates);
      _this.onUpdate && _this.onUpdate();
    };

    this.unmount = function () {
      _this.docThunk.unmount();
    };

    this.mapRemoteToProps = mapRemoteToProps;
    this.remoteState = {};
    this.mapState = {};
    this.graphThunk = new _graphThunk2.default(racerModel, this.receiveUpdates);
    this.docThunk = new _docThunk2.default(racerModel, this.receiveUpdates);
    this.select = new _selectThunk2.default(null, racerModel);
  }

  _createClass(Remote, [{
    key: 'map',
    value: function map(reactProps) {
      var _this2 = this;

      var remote = {
        graph: this.graphThunk.thunk(reactProps),
        doc: this.docThunk.thunk(reactProps)
      };

      return Promise.resolve(this.mapRemoteToProps && this.mapRemoteToProps(remote, this.select.thunks(reactProps), reactProps)).then(function (mapState) {
        _this2.mapState = mapState;
        _this2.receiveUpdates();
      });
    }
  }, {
    key: 'setOnScreen',
    value: function setOnScreen(onScreen) {
      this.docThunk.onScreen = onScreen;
      this.docThunk.checkOnScreen();
    }
  }, {
    key: 'state',
    get: function get() {
      return _extends({}, this.remoteState, this.mapState);
    }
  }]);

  return Remote;
}();

exports.default = Remote;