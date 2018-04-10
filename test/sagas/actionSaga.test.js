import 'testHelper';

import { call, take } from 'redux-saga/effects';

import actionSaga, { createSagaActions } from 'sagas/actionSaga';
import createActions from 'util/createActions';
import { actionMatcher } from 'util/matchers';
import { ACTION_RESET, ACTION_CANCEL, ACTION_CLEAN } from '../../src/values/api';

describe('actionSaga', () => {
  const ID = 'TEST';
  const actions = createActions(ID, (arg) => (state) => `my ${arg} ${state.bar}`);
  const actionState = actions.call('foo');
  const storeState = { bar: 'baz' };
  const saga = actionSaga(storeState, actionState);
  const step = saga.next().value;

  it('initiates a race', () => {
    expect(Object.keys(step)).to.deep.equal(['@@redux-saga/IO', 'RACE']);
    expect(step['@@redux-saga/IO']).to.be.true();

    const raceKeys = ['call', 'cancel', 'reset', 'clean'];
    expect(Object.keys(step.RACE)).to.deep.equal(raceKeys);
    raceKeys.forEach((key) => {
      expect(step.RACE[key]).to.be.instanceOf(Object);
    });
  });

  it('returns true', () => {
    expect(saga.next().value).to.be.true();
  });

  describe('call action', () => {
    const callState = step.RACE.call.CALL;
    const sagaActions = createSagaActions(actionState.meta);

    it('contains the correct arguments', () => {
      const action = call(callState.fn, storeState, actionState.payload, sagaActions);
      expect(JSON.stringify(action.CALL.args)).to.deep.equal(JSON.stringify(callState.args));
    });

    it('performs the action', () => {
      const action = call(callState.fn, storeState, actionState.payload, sagaActions);
      const fn = action.CALL.fn(...action.CALL.args);
      fn.next(); // account for delay
      const response = fn.next().value;
      const result = response.CALL.fn(...response.CALL.args);
      expect(result).to.equal('my foo baz');
    });
  });

  describe('reset action', () => {
    const resetState = step.RACE.reset.TAKE;
    const reset = take(actionMatcher(ACTION_RESET, ID));

    it('performs valid actions', () => {
      const validAction = actions.reset();
      expect(resetState.pattern(validAction)).to.be.true();
      expect(resetState.pattern(validAction)).to.equal(reset.TAKE.pattern(validAction));
    });

    it('does not perform invalid actions', () => {
      const invalidAction = { type: 'INVALID' };
      expect(resetState.pattern(invalidAction)).to.be.false();
      expect(resetState.pattern(invalidAction)).to.equal(reset.TAKE.pattern(invalidAction));
    });
  });

  describe('cancel action', () => {
    const cancelState = step.RACE.cancel.TAKE;
    const cancel = take(actionMatcher(ACTION_CANCEL, ID));

    it('performs valid actions', () => {
      const validAction = actions.cancel();
      expect(cancelState.pattern(validAction)).to.be.true();
      expect(cancelState.pattern(validAction)).to.equal(cancel.TAKE.pattern(validAction));
    });

    it('does not perform invalid actions', () => {
      const invalidAction = { type: 'INVALID' };
      expect(cancelState.pattern(invalidAction)).to.be.false();
      expect(cancelState.pattern(invalidAction)).to.equal(cancel.TAKE.pattern(invalidAction));
    });
  });

  describe('clean action', () => {
    const cleanState = step.RACE.clean.TAKE;
    const clean = take(actionMatcher(ACTION_CLEAN, ID));

    it('performs valid actions', () => {
      const validAction = actions.clean();
      expect(cleanState.pattern(validAction)).to.be.true();
      expect(cleanState.pattern(validAction)).to.equal(clean.TAKE.pattern(validAction));
    });

    it('does not perform invalid actions', () => {
      const invalidAction = { type: 'INVALID' };
      expect(cleanState.pattern(invalidAction)).to.be.false();
      expect(cleanState.pattern(invalidAction)).to.equal(clean.TAKE.pattern(invalidAction));
    });
  });
});
