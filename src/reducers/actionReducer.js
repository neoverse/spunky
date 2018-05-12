// @flow
import { get, set, unset } from 'lodash';

import {
  ACTION_CALL,
  ACTION_SUCCESS,
  ACTION_FAILURE,
  ACTION_RESET,
  ACTION_CANCEL,
  ACTION_CLEAN
} from '../values/api';
import { INITIAL, LOADING, LOADED, FAILED } from '../values/progress';
import { type Data, type Error, type ActionState, type Progress } from '../values/types';

type State = {
  batch: false,
  progress: Progress,
  rollbackProgress: Progress | null,
  loadedCount: number,
  data: Data,
  error: Error
};

export const initialState: State = {
  batch: false,
  progress: INITIAL,
  rollbackProgress: null,
  loadedCount: 0,
  data: null,
  error: null
};

function reduceAction(state: State = initialState, actionState: ActionState): Object {
  switch (actionState.meta.type) {
    case ACTION_CALL:
      return { ...state, progress: LOADING, rollbackProgress: state.progress };
    case ACTION_SUCCESS:
      return { ...state, progress: LOADED, rollbackProgress: LOADED, data: actionState.payload, loadedCount: state.loadedCount + 1 };
    case ACTION_FAILURE:
      return { ...state, progress: FAILED, rollbackProgress: FAILED, error: actionState.payload };
    case ACTION_RESET:
      return { ...state, ...initialState };
    case ACTION_CANCEL:
      return { ...state, progress: state.rollbackProgress };
    default:
      return state;
  }
}

export default function actionReducer(state: Object = {}, actionState: ActionState): Object {
  const { id, type } = actionState.meta;

  if (type === ACTION_CLEAN) {
    return unset({ ...state }, id);
  } else if (type) {
    return set({ ...state }, id, reduceAction(get(state, id), actionState));
  } else {
    return state;
  }
}
