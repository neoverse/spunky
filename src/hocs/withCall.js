// @flow
import React, { type ComponentType } from 'react';
import { connect } from 'react-redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';
import { type Dispatch } from 'redux';

import withoutProps from './withoutProps';
import { type Actions } from '../values/types';

type Options = {
  propName: string
}

type Props = {
  [key: string]: Function
};

function defaultMapPropsToAction(props: Object): Object {
  return props;
}

export default function withCall(
  actions: Actions,
  mapPropsToAction: Function = defaultMapPropsToAction,
  { propName = 'performAction' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  function mapDispatchToProps(dispatch: Dispatch<*>): Props {
    return {
      [propName]: (props: Object) => dispatch(actions.call(props))
    };
  }

  return (Component: ComponentType<any>): ComponentType<any> => {
    const WrappedComponent = withoutProps(propName)(Component);

    class ComponentWithFetch extends React.Component<Props> {
      static displayName = 'ComponentWithFetch';

      componentWillMount = () => {
        this.props[propName](mapPropsToAction(this.props));
      }

      render = () => {
        return <WrappedComponent {...this.props} />;
      }
    }

    return compose(
      connect(null, mapDispatchToProps),
      setDisplayName(wrapDisplayName(Component, 'withCall'))
    )(ComponentWithFetch);
  };
}
