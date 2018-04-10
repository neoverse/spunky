// @flow
import { select, all, takeEvery } from 'redux-saga/effects';
import { type Saga } from 'redux-saga';

import batchSaga from './batchSaga';
import actionSaga from './actionSaga';
import { actionTypeMatcher } from '../util/matchers';
import { ACTION_CALL, BATCH_CALL, BATCH_RESET, BATCH_CANCEL, BATCH_CLEAN } from '../values/api';
import { type ActionState } from '../values/types';

const createMatchers = (actionTypes) => actionTypes.map(actionTypeMatcher);

const actionMatchers = createMatchers([ACTION_CALL]);
const batchMatchers = createMatchers([BATCH_CALL, BATCH_RESET, BATCH_CANCEL, BATCH_CLEAN]);

function action(actionState: ActionState) {
  return actionMatchers.some((matcher) => matcher(actionState));
}

function batchAction(actionState: ActionState) {
  return batchMatchers.some((matcher) => matcher(actionState));
}

export default function* root(): Saga<void> {
  const state = yield select();

  yield all([
    takeEvery(action, actionSaga, state),
    takeEvery(batchAction, batchSaga, state)
  ]);
}
