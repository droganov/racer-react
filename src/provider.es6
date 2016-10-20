// inspired by https://github.com/rackt/react-redux/blob/master/src/components/Provider.js
import { PropTypes, Children, Component } from 'react';

export default class Provider extends Component {
  static childContextTypes = {
    racerModel: PropTypes.object.isRequired,
  };
  static propTypes = {
    racerModel: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };
  getChildContext() {
    return {
      racerModel: this.props.racerModel,
    };
  }
  render() {
    return Children.only(this.props.children);
  }
}
