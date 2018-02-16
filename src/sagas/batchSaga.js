// @flow
import { map } from 'lodash';
import { put, take, race, all, call } from 'redux-saga/effects';
import { type Saga } from 'redux-saga';

import { actionMatcher } from '../util/matchers';
import { BATCH_SUCCESS, BATCH_FAILURE, BATCH_RESET, BATCH_CANCEL } from '../values/api';
import {
  type Error,
  type ActionMeta,
  type ActionState,
  type ActionStateMap
} from '../values/types';

type SagaActions = {
  request: Function,
  success: Function,
  failure: Function
};

function createSagaActions(meta: ActionMeta): SagaActions {
  function* delegateAction(state: Object, actionState: ActionState) {
    yield put(actionState);
  }

  function* request(state: Object, calls: ActionStateMap, actions: SagaActions) {
    try {
      yield all(map(calls, (actionState) => delegateAction(state, actionState)));
      yield put(actions.success());
    } catch (err) {
      yield put(actions.failure(err.message));
    }
  }

  function success(): ActionState {
    return {
      batch: true,
      type: `${meta.id}/${BATCH_SUCCESS}`,
      meta: { ...meta, type: BATCH_SUCCESS }
    };
  }

  function failure(error: Error): ActionState {
    return {
      batch: true,
      type: `${meta.id}/${BATCH_FAILURE}`,
      meta: { ...meta, type: BATCH_FAILURE },
      payload: error
    };
  }

  return { request, success, failure };
}

export default function* batchSaga(state: Object, actionState: ActionState): Saga<boolean> {
  const { id } = actionState.meta;
  const { payload } = actionState;

  if (!payload || !payload.calls) {
    return false;
  }

  const sagaActions = createSagaActions(actionState.meta);

  yield race({
    call: call(sagaActions.request, state, payload.calls, sagaActions),
    cancel: take(actionMatcher(BATCH_CANCEL, id)),
    reset: take(actionMatcher(BATCH_RESET, id))
  });

  return true;
}
