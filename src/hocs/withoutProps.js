// @flow
import _ from 'lodash';
import React, { type ComponentType } from 'react';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

export default function withoutProps(
  ...propNames: Array<string>
): (Component: ComponentType<any>) => ComponentType<any> {
  return (Component: ComponentType<any>): ComponentType<any> => {
    const ComponentWithoutProps = (props: Object) => {
      const passDownProps = _.omit(props, ...propNames);
      return <Component {...passDownProps} />;
    };

    return compose(
      setDisplayName(wrapDisplayName(Component, 'withoutProps'))
    )(ComponentWithoutProps);
  };
}
