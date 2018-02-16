// @flow
import { get } from 'lodash';

import {
  BATCH_CALL, BATCH_CANCEL, BATCH_SUCCESS, BATCH_FAILURE, BATCH_RESET,
  ACTION_CALL, ACTION_CANCEL, ACTION_SUCCESS, ACTION_FAILURE, ACTION_RESET
} from '../values/api';

const ACTION_TYPES = [
  BATCH_CALL, BATCH_CANCEL, BATCH_SUCCESS, BATCH_FAILURE, BATCH_RESET,
  ACTION_CALL, ACTION_CANCEL, ACTION_SUCCESS, ACTION_FAILURE, ACTION_RESET
];

function isRecognizedType(action: Object): boolean {
  const actionType = get(action, 'meta.type');
  return ACTION_TYPES.includes(actionType);
}

export function isBatch(action: Object): boolean {
  return isRecognizedType(action) && action.batch === true;
}

export function isAction(action: Object): boolean {
  return isRecognizedType(action) && action.batch === false;
}
