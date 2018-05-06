// @flow
import {
  ACTION_CALL,
  ACTION_CANCEL,
  ACTION_SUCCESS,
  ACTION_FAILURE,
  ACTION_RESET,
  ACTION_CLEAN
} from '../values/api';
import { type Actions, type ActionState, type ActionTypeMap } from '../values/types';

const createActionTypes = (statePath: string): ActionTypeMap => ({
  CALL: `${statePath}/${ACTION_CALL}`,
  CANCEL: `${statePath}/${ACTION_CANCEL}`,
  SUCCESS: `${statePath}/${ACTION_SUCCESS}`,
  FAILURE: `${statePath}/${ACTION_FAILURE}`,
  RESET: `${statePath}/${ACTION_RESET}`,
  CLEAN: `${statePath}/${ACTION_CLEAN}`
});

export default function createActions(id: string, createAdaptor: Function): Actions {
  const actionTypes = createActionTypes(id);

  const call = (props: Object): ActionState => ({
    batch: false,
    type: actionTypes.CALL,
    meta: { type: ACTION_CALL, id },
    payload: { fn: createAdaptor(props) }
  });

  const cancel = (): ActionState => ({
    batch: false,
    type: actionTypes.CANCEL,
    meta: { type: ACTION_CANCEL, id }
  });

  const reset = (): ActionState => ({
    batch: false,
    type: actionTypes.RESET,
    meta: { type: ACTION_RESET, id }
  });

  const clean = (): ActionState => ({
    batch: false,
    type: actionTypes.CLEAN,
    meta: { type: ACTION_CLEAN, id }
  });

  return { id, call, cancel, reset, clean, actionTypes, batch: false };
}
