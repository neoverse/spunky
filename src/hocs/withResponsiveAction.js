// @flow
import React, { type ComponentType } from 'react';
import { wrapDisplayName } from 'recompose';
import { isEqual, some, castArray } from 'lodash';

import withActions from './withActions';
import withoutProps from './withoutProps';
import { type Actions, type ActionName } from '../values/types';

type Props = {
  [key: string]: Function
};

type Options = {
  propName?: string
};

export type ShouldPerform = Array<string> | string | Function;

function createShouldPerform(shouldPerformDefinition: ShouldPerform) {
  if (typeof shouldPerformDefinition === 'function') {
    return shouldPerformDefinition;
  } else {
    const shouldPerformProps = castArray(shouldPerformDefinition);

    return (prevProps: Object, props: Object): boolean => {
      return some(shouldPerformProps, (key) => !isEqual(prevProps[key], props[key]));
    };
  }
}

export default function withResponsiveAction(
  actions: Actions,
  actionName: ActionName,
  shouldPerformDefinition: ShouldPerform,
  { propName = 'performAction' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  const shouldPerform = createShouldPerform(shouldPerformDefinition);

  // eslint-disable-next-line no-shadow
  const mapActionsToProps = (actions: Actions, _props: Object): Object => ({
    [propName]: (...args: Array<any>) => actions[actionName](...args)
  });

  return (Component: ComponentType<any>): ComponentType<any> => {
    const WrappedComponent = withoutProps(propName)(Component);

    class ComponentWithResponsiveAction extends React.Component<Props> {
      static displayName = wrapDisplayName(Component, 'withResponsiveAction');

      componentDidUpdate = (prevProps) => {
        if (shouldPerform(prevProps, this.props)) {
          this.props[propName](this.props);
        }
      }

      render = () => {
        return <WrappedComponent {...this.props} />;
      }
    }

    return withActions(actions, mapActionsToProps)(ComponentWithResponsiveAction);
  };
}
