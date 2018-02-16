// @flow
import { type ComponentType } from 'react';
import { get, map, castArray } from 'lodash';
import { connect, type MapStateToProps } from 'react-redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import initiallyLoadedStrategy from './progressStrategies/initiallyLoadedStrategy';
import { INITIAL } from '../values/progress';
import { type Actions, type ActionState, type Progress } from '../values/types';

type Options = {
  strategy?: (Array<Object>) => Progress,
  prefix?: string,
  propName?: string
};

export default function withProgress(
  actions: Actions,
  { strategy = initiallyLoadedStrategy, prefix = 'react-redux-lifecycle', propName = 'progress' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  const mapProgressToProps = (actionStates: Array<ActionState>) => ({
    [propName]: strategy(actionStates)
  });

  // TODO: this doesn't account for batch within a batch, need to make this recursive
  const getActionStates = (state: Object): Array<ActionState> => {
    const actionState = get(state, `${prefix}.${actions.id}`);

    if (!actionState) {
      return [];
    } else if (actionState.batch) {
      return map(actionState.mapping, (key) => get(state, `${prefix}.${key}`, INITIAL));
    } else {
      return castArray(actionState);
    }
  };

  const mapStateToProps: MapStateToProps<*, *, *> = (state: Object): Object => {
    return mapProgressToProps(getActionStates(state));
  };

  return (Component: ComponentType<any>): ComponentType<any> => {
    return compose(
      connect(mapStateToProps),
      setDisplayName(wrapDisplayName(Component, 'withProgress'))
    )(Component);
  };
}
