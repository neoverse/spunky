import 'testHelper';

import createBatchActions from 'util/createBatchActions';
import createActions from 'util/createActions';

describe('createBatchActions', () => {
  const REQ1_ID = 'TEST_REQ1';
  const REQ2_ID = 'TEST_REQ2';
  const BATCH_ID = 'TEST_BATCH';

  const actions1 = createActions(REQ1_ID, (_arg) => () => 'foo');
  const actions2 = createActions(REQ2_ID, (_arg) => () => 'bar');
  const actions = createBatchActions(BATCH_ID, {
    one: actions1,
    two: actions2
  });

  it('defines an object with an appropriate actions structure', () => {
    expect(actions.id).to.equal(BATCH_ID);
    expect(actions.call).to.be.instanceOf(Function);
    expect(actions.reset).to.be.instanceOf(Function);
    expect(actions.cancel).to.be.instanceOf(Function);
    expect(actions.actionTypes).to.deep.equal({
      CALL: 'BATCH/CALL',
      RESET: 'BATCH/RESET',
      CANCEL: 'BATCH/CANCEL',
      SUCCESS: 'BATCH/SUCCESS',
      FAILURE: 'BATCH/FAILURE',
      CLEAN: 'BATCH/CLEAN'
    });
  });

  it('defines a call function', function () {
    actions1.call = this.sinon.spy();
    actions2.call = this.sinon.spy();

    expect(actions.call('arg')).to.deep.equal({
      batch: true,
      type: 'BATCH/CALL',
      meta: { id: BATCH_ID, type: 'BATCH/CALL' },
      payload: { calls: { one: actions1.call('arg'), two: actions2.call('arg') } }
    });
  });

  it('defines a reset function', () => {
    expect(actions.reset()).to.deep.equal({
      batch: true,
      type: 'BATCH/RESET',
      meta: { id: BATCH_ID, type: 'BATCH/RESET' },
      payload: { calls: { one: actions1.reset(), two: actions2.reset() } }
    });
  });

  it('defines a cancel function', () => {
    expect(actions.cancel()).to.deep.equal({
      batch: true,
      type: 'BATCH/CANCEL',
      meta: { id: BATCH_ID, type: 'BATCH/CANCEL' },
      payload: { calls: { one: actions1.cancel(), two: actions2.cancel() } }
    });
  });

  it('defines a clean function', () => {
    expect(actions.clean()).to.deep.equal({
      batch: true,
      type: 'BATCH/CLEAN',
      meta: { id: BATCH_ID, type: 'BATCH/CLEAN' },
      payload: { calls: { one: actions1.clean(), two: actions2.clean() } }
    });
  });
});
