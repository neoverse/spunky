// @flow
import { some, every } from 'lodash';

import { type Progress } from '../../values/types';
import { INITIAL, LOADING, LOADED, FAILED } from '../../values/progress';

function isLoading(actionState: Object) {
  return actionState.progress === INITIAL || actionState.progress === LOADING;
}

function wasRecently(actionState: Object, progress: string) {
  return actionState.progress === progress || (
    isLoading(actionState) && actionState.rollbackProgress === progress
  );
}

function anyRecentlyFailed(actionStates: Array<Object>): boolean {
  return some(actionStates, (actionState) => wasRecently(actionState, FAILED));
}

function allRecentlyLoaded(actionStates: Array<Object>): boolean {
  return every(actionStates, (actionState) => wasRecently(actionState, LOADED));
}

export default function recentlyCompletedStrategy(actions: Array<Object>): Progress {
  if (anyRecentlyFailed(actions)) {
    return FAILED;
  } else if (allRecentlyLoaded(actions) && actions.length > 0) {
    return LOADED;
  } else {
    return LOADING;
  }
}
