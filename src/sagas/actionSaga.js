// @flow
import { call, put, race, take } from 'redux-saga/effects';
import { delay, type Saga } from 'redux-saga';

import { actionMatcher } from '../util/matchers';
import { ACTION_SUCCESS, ACTION_FAILURE, ACTION_RESET, ACTION_CANCEL } from '../values/api';
import {
  type Error,
  type Payload,
  type ActionMeta,
  type ActionState
} from '../values/types';

type SagaActions = {
  request: Function,
  success: Function,
  failure: Function
};

export function createSagaActions(meta: ActionMeta): SagaActions {
  function* request(state: Object, payload: Payload, actions: SagaActions) {
    yield delay(0); // allow request state to propagate

    try {
      const result = yield call(payload.fn, state);
      yield put(actions.success(result));
    } catch (err) {
      yield put(actions.failure(err.message));
    }
  }

  function success(result: any): ActionState {
    return {
      batch: false,
      type: `${meta.id}/${ACTION_SUCCESS}`,
      meta: { ...meta, type: ACTION_SUCCESS },
      payload: result
    };
  }

  function failure(error: Error): ActionState {
    return {
      batch: false,
      type: `${meta.id}/${ACTION_FAILURE}`,
      meta: { ...meta, type: ACTION_FAILURE },
      payload: error
    };
  }

  return { request, success, failure };
}

export default function* actionSaga(state: Object, actionState: ActionState): Saga<boolean> {
  const { id } = actionState.meta;
  const sagaActions = createSagaActions(actionState.meta);

  yield race({
    call: call(sagaActions.request, state, actionState.payload, sagaActions),
    cancel: take(actionMatcher(ACTION_CANCEL, id)),
    reset: take(actionMatcher(ACTION_RESET, id))
  });

  return true;
}
