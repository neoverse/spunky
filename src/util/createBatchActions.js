// @flow
import { mapValues } from 'lodash';

import {
  BATCH_CALL,
  BATCH_CANCEL,
  BATCH_SUCCESS,
  BATCH_FAILURE,
  BATCH_RESET
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
  RESET: BATCH_RESET
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

  return { id, call, cancel, reset, actionTypes };
}
