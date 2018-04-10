// @flow
import { type ComponentType } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import { type Actions } from '../values/types';

const defaultMapActionsToProps = (actions: Actions, _props: Object): Object => ({
  call: actions.call,
  cancel: actions.cancel,
  reset: actions.reset,
  clean: actions.clean
});

const createMapDispatchToProps = (actions: Actions, mapActionsToProps: Function): Object => {
  return (dispatch, props) => bindActionCreators(mapActionsToProps(actions, props), dispatch);
};

export default function withActions(
  actions: Actions,
  mapActionsToProps: Function = defaultMapActionsToProps
): (Component: ComponentType<any>) => ComponentType<any> {
  const mapDispatchToProps = createMapDispatchToProps(actions, mapActionsToProps);

  return (Component: ComponentType<any>): ComponentType<any> => {
    return compose(
      connect(null, mapDispatchToProps),
      setDisplayName(wrapDisplayName(Component, 'withActions'))
    )(Component);
  };
}
