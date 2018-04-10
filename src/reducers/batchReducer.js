// @flow
import { get, set, unset, mapValues } from 'lodash';

import { BATCH_CALL, BATCH_CLEAN } from '../values/api';
import { type ActionState } from '../values/types';

type State = {
  batch: true,
  mapping: null
};

const initialState: State = {
  batch: true,
  mapping: null
};

function createMapping(actionState: ActionState) {
  const { payload } = actionState;

  if (typeof payload === 'object' && typeof payload.calls === 'object') {
    return mapValues(payload.calls, (call) => get(call, 'meta.id', null));
  } else {
    return [];
  }
}

function reduceBatch(state: State = initialState, actionState: ActionState): Object {
  switch (actionState.meta.type) {
    case BATCH_CALL:
      return { ...state, mapping: createMapping(actionState) };
    default:
      return state;
  }
}

export default function batchReducer(state: Object = {}, actionState: ActionState): Object {
  const { id, type } = actionState.meta;

  if (type === BATCH_CLEAN) {
    return unset({ ...state }, id);
  } else if (type) {
    return set({ ...state }, id, reduceBatch(get(state, id), actionState));
  } else {
    return state;
  }
}
