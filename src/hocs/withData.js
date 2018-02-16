// @flow
import { type ComponentType } from 'react';
import { get, mapValues } from 'lodash';
import { connect, type MapStateToProps } from 'react-redux';
import { compose, setDisplayName, wrapDisplayName } from 'recompose';

import { type Data, type Actions, type ActionStateMap } from '../values/types';

type Options = {
  prefix: string
};

const mapActionDataToProps: Function = (data: Data): any => data;

const mapBatchDataToProps: Function = (
  state: Object,
  id: string,
  mapping: ActionStateMap,
  prefix: string
): Object => {
  // eslint-disable-next-line no-use-before-define
  return mapValues(mapping, (key) => mapDataToProps(state, key, prefix));
};

const mapDataToProps: Function = (state: Object, id: string, prefix: string): any => {
  const actionState = get(state, `${prefix}.${id}`);

  if (!actionState) {
    return null;
  } else if (actionState.batch) {
    return mapBatchDataToProps(state, id, actionState.mapping, prefix);
  } else {
    return mapActionDataToProps(actionState.data);
  }
};

export default function withData(
  actions: Actions,
  mapper: Function = mapActionDataToProps,
  { prefix = 'spunky' }: Options = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  const mapStateToProps: MapStateToProps<*, *, *> = (state: Object, ownProps: Object): Object => {
    return mapper(mapDataToProps(state, actions.id, prefix), ownProps);
  };

  return (Component: ComponentType<any>): ComponentType<any> => {
    return compose(
      connect(mapStateToProps),
      setDisplayName(wrapDisplayName(Component, 'withData'))
    )(Component);
  };
}
