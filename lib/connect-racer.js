'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactVisibilitySensor = require('react-visibility-sensor');

var _reactVisibilitySensor2 = _interopRequireDefault(_reactVisibilitySensor);

var _remote = require('./remote');

var _remote2 = _interopRequireDefault(_remote);

var _selectThunk = require('./select-thunk');

var _selectThunk2 = _interopRequireDefault(_selectThunk);

var _dispatchThunk = require('./dispatch-thunk');

var _dispatchThunk2 = _interopRequireDefault(_dispatchThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var connectDecorator = function connectDecorator() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _mapRemoteToProps = _ref.mapRemoteToProps;
  var mapSelectToProps = _ref.mapSelectToProps;
  var mapDispatchToProps = _ref.mapDispatchToProps;
  return function (Child) {
    var ConnectRacerReact = function (_Component) {
      _inherits(ConnectRacerReact, _Component);

      function ConnectRacerReact() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, ConnectRacerReact);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = ConnectRacerReact.__proto__ || Object.getPrototypeOf(ConnectRacerReact)).call.apply(_ref2, [this].concat(args))), _this), _this.handleVisibilityChange = function (isVisible) {
          _this.remote && _this.remote.setOnScreen && _this.remote.setOnScreen(isVisible);
        }, _this.render = function () {
          return _react2.default.createElement(
            _reactVisibilitySensor2.default,
            {
              delay: 500,
              delayedCall: true,
              partialVisibility: true,
              onChange: _this.handleVisibilityChange
            },
            _react2.default.createElement(Child, _extends({}, _this.dispatch.getState(_this.props, _extends({}, _this.remote && _this.remote.state, _this.select.state(_this.props)), Child.name), _this.props))
          );
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ConnectRacerReact, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _this2 = this;

          var context = this.context;
          var racerModel = context.racerModel;


          if (this.isRoute) {
            this.remote = new _remote2.default(_mapRemoteToProps, racerModel);
            this.remote.map(this.props);
          }

          this.select = new _selectThunk2.default(mapSelectToProps, racerModel);

          this.dispatch = new _dispatchThunk2.default(mapDispatchToProps, racerModel, function () {
            return _this2.forceUpdate();
          });
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this3 = this;

          var context = this.context;
          var racerModel = context.racerModel;


          if (!this.isRoute) {
            this.remote = new _remote2.default(_mapRemoteToProps, racerModel);
          }

          this.remote.onUpdate = function () {
            return _this3.forceUpdate();
          };

          if (!this.isRoute) {
            this.remote.map(this.props);
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          this.remote.map(nextProps);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.remote.unmount();
        }
      }, {
        key: 'isRoute',
        get: function get() {
          return 'route' in this.props;
        }
      }]);

      return ConnectRacerReact;
    }(_react.Component);

    ConnectRacerReact.contextTypes = { racerModel: _react2.default.PropTypes.object.isRequired };
    ConnectRacerReact.displayName = 'RacerReact';
    ConnectRacerReact.statics = {
      mapRemoteToProps: function mapRemoteToProps(racerModel, reactProps) {
        return new _remote2.default(_mapRemoteToProps, racerModel).map(reactProps);
      }
    };


    return ConnectRacerReact;
  };
};

exports.default = connectDecorator;