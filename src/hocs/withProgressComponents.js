// @flow
import React, { type ComponentType } from 'react';
import { omit } from 'lodash';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import initiallyLoadedStrategy from './progressStrategies/initiallyLoadedStrategy';
import withProgress from './withProgress';
import { type Actions, type Progress } from '../values/types';

type Props = {
  [key: string]: Progress
};

type Mapping = {
  [key: Progress]: ComponentType<any>
};

type Options = {
  strategy?: (Array<Object>) => Progress,
  prefix?: string,
  propName?: string
};

export default function withProgressComponents(
  actions: Actions,
  mapping: Mapping = {},
  { strategy = initiallyLoadedStrategy, prefix = 'spunky', propName = 'progress' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  return (Component: ComponentType<any>): ComponentType<any> => {
    function ComponentWithProgressComponents(props: Props) {
      const MappedComponent = mapping[props[propName]] || Component;
      const passDownProps = omit(props, propName);
      return <MappedComponent {...passDownProps} />;
    }

    return compose(
      withProgress(actions, { strategy, prefix, propName }),
      setDisplayName(wrapDisplayName(Component, 'withProgressComponents'))
    )(ComponentWithProgressComponents);
  };
}
