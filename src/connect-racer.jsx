import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import Remote from './remote';
import Select from './select-thunk';
import Dispatch from './dispatch-thunk';


const connectDecorator = ({ mapRemoteToProps, mapSelectToProps, mapDispatchToProps } = {}) =>
  Child => {
    class ConnectRacerReact extends Component {
      static contextTypes = { racerModel: React.PropTypes.object.isRequired };
      static displayName = 'RacerReact';
      static statics = {
        mapRemoteToProps: (racerModel, reactProps) =>
          new Remote(
            mapRemoteToProps,
            racerModel,
          ).map(reactProps),
      };

      componentWillMount() {
        const { context } = this;
        const { racerModel } = context;

        if (this.isRoute) {
          this.remote = new Remote(
            mapRemoteToProps,
            racerModel,
          );
          this.remote.map(this.props);
        }

        this.select = new Select(
          mapSelectToProps,
          racerModel,
        );

        this.dispatch = new Dispatch(
          mapDispatchToProps,
          racerModel,
          () => this.forceUpdate(),
        );
      }

      componentDidMount() {
        const { context } = this;
        const { racerModel } = context;

        if (!this.isRoute) {
          this.remote = new Remote(
            mapRemoteToProps,
            racerModel,
          );
        }

        this.remote.onUpdate = () => this.forceUpdate();

        if (!this.isRoute) {
          this.remote.map(this.props);
        }
      }

      componentWillReceiveProps(nextProps) {
        this.remote.map(nextProps);
      }

      componentWillUnmount() {
        this.remote.unmount();
      }

      get isRoute() {
        return ('route' in this.props);
      }

      handleVisibilityChange = (isVisible) => {
        this.remote &&
        this.remote.setOnScreen &&
        this.remote.setOnScreen(isVisible);
      }

      render = () =>
        <VisibilitySensor
          delay={500}
          delayedCall
          partialVisibility
          onChange={this.handleVisibilityChange}
        >
          <Child
            {
              ...this.dispatch.getState(this.props, {
                ...this.remote && this.remote.state,
                ...this.select.state(this.props),
              }, Child.name)
            }
            {...this.props}
          />
        </VisibilitySensor>
    }

    return ConnectRacerReact;
  };

export default connectDecorator;
