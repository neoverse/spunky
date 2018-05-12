// @flow
import { type ComponentType } from 'react';
import { get, map, flatten, uniq, reduce } from 'lodash';
import { connect, type MapStateToProps } from 'react-redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import initiallyLoadedStrategy from './progressStrategies/initiallyLoadedStrategy';
import { initialState } from '../reducers/actionReducer';
import { type Actions, type ActionState, type Progress } from '../values/types';

type Options = {
  strategy?: (Array<Object>) => Progress,
  prefix?: string,
  propName?: string
};

const getActionIds = (actions: Actions): Array<string> => {
  if (!actions.batch) {
    return [actions.id];
  }

  return uniq(flatten(reduce(actions.actions, (ids, childActions) => {
    ids.push(getActionIds(childActions));
    return ids;
  }, [])));
};

export default function withProgress(
  actions: Actions,
  { strategy = initiallyLoadedStrategy, prefix = 'spunky', propName = 'progress' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  const actionIds = getActionIds(actions);

  const mapProgressToProps = (actionStates: Array<ActionState>) => ({
    [propName]: strategy(actionStates)
  });

  const getActionStates = (state: Object): Array<ActionState> => {
    return map(actionIds, (id) => get(state, `${prefix}.${id}`, initialState));
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
