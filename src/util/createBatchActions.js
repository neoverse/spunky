// @flow
import { mapValues } from 'lodash';

import {
  BATCH_CALL,
  BATCH_CANCEL,
  BATCH_SUCCESS,
  BATCH_FAILURE,
  BATCH_RESET,
  BATCH_CLEAN
} from '../values/api';

import {
  type Actions,
  type ActionName,
  type ActionState,
  type ActionTypeMap,
  type ActionMapping
} from '../values/types';

const actionTypes: ActionTypeMap = {
  CALL: BATCH_CALL,
  CANCEL: BATCH_CANCEL,
  SUCCESS: BATCH_SUCCESS,
  FAILURE: BATCH_FAILURE,
  RESET: BATCH_RESET,
  CLEAN: BATCH_CLEAN
};

function mapActions(
  actionsMap: Object,
  actionName: ActionName,
  ...params: Array<any>
): ActionMapping {
  return mapValues(actionsMap, (actions: Actions) => actions[actionName](...params));
}

export default function createBatchActions(id: string, actionsMap: Object): Actions {
  const call = (props: Object): ActionState => ({
    batch: true,
    type: actionTypes.CALL,
    meta: { type: BATCH_CALL, id },
    payload: { calls: mapActions(actionsMap, 'call', props) }
  });

  const cancel = (): ActionState => ({
    batch: true,
    type: actionTypes.CANCEL,
    meta: { type: BATCH_CANCEL, id },
    payload: { calls: mapActions(actionsMap, 'cancel') }
  });

  const reset = (): ActionState => ({
    batch: true,
    type: actionTypes.RESET,
    meta: { type: BATCH_RESET, id },
    payload: { calls: mapActions(actionsMap, 'reset') }
  });

  const clean = (): ActionState => ({
    batch: true,
    type: actionTypes.CLEAN,
    meta: { type: BATCH_CLEAN, id },
    payload: { calls: mapActions(actionsMap, 'clean') }
  });

  return { id, call, cancel, reset, clean, actionTypes };
}
