// @flow
import { some, every } from 'lodash';

import { LOADING, LOADED, FAILED } from '../../values/progress';
import { type Progress } from '../../values/types';

function anyFailed(actionStates: Array<Object>): boolean {
  return some(actionStates, (actionState) => actionState.progress === FAILED);
}

function allLoaded(actionStates: Array<Object>): boolean {
  return every(actionStates, (actionState) => actionState.progress === LOADED);
}

export default function initiallyLoadedStrategy(actions: Array<Object>): Progress {
  if (anyFailed(actions)) {
    return FAILED;
  } else if (allLoaded(actions) && actions.length > 0) {
    return LOADED;
  } else {
    return LOADING;
  }
}
