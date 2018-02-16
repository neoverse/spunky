// @flow
import { type ComponentType } from 'react';
import { get, mapValues } from 'lodash';
import { connect, type MapStateToProps } from 'react-redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import { type Error, type Actions, type ActionStateMap } from '../values/types';

type Options = {
  prefix: string
};

const mapActionErrorToProps: Function = (error: Error): any => error;

const mapBatchErrorToProps: Function = (
  state: Object,
  id: string,
  mapping: ActionStateMap,
  prefix: string
): Object => {
  // eslint-disable-next-line no-use-before-define
  return mapValues(mapping, (key) => mapErrorToProps(state, key, prefix));
};

const mapErrorToProps: Function = (state: Object, id: string, prefix: string): any => {
  const actionState = get(state, `${prefix}.${id}`);

  if (!actionState) {
    return null;
  } else if (actionState.batch) {
    return mapBatchErrorToProps(state, id, actionState.mapping, prefix);
  } else {
    return mapActionErrorToProps(actionState.error);
  }
};

export default function withError(
  actions: Actions,
  mapper: Function = mapActionErrorToProps,
  { prefix = 'spunky' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  const mapStateToProps: MapStateToProps<*, *, *> = (state: Object, ownProps: Object): Object => {
    return mapper(mapErrorToProps(state, actions.id, prefix), ownProps);
  };

  return (Component: ComponentType<any>): ComponentType<any> => {
    return compose(
      connect(mapStateToProps),
      setDisplayName(wrapDisplayName(Component, 'withError'))
    )(Component);
  };
}
