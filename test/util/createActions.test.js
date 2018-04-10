import 'testHelper';

import createActions from 'util/createActions';

describe('createActions', () => {
  const ID = 'TEST';
  const actions = createActions(ID, (_arg) => () => 'foo');

  it('defines an object with an appropriate actions structure', () => {
    expect(actions.id).to.equal(ID);
    expect(actions.call).to.be.instanceOf(Function);
    expect(actions.reset).to.be.instanceOf(Function);
    expect(actions.cancel).to.be.instanceOf(Function);
    expect(actions.actionTypes).to.deep.equal({
      CALL: 'TEST/ACTION/CALL',
      RESET: 'TEST/ACTION/RESET',
      CANCEL: 'TEST/ACTION/CANCEL',
      SUCCESS: 'TEST/ACTION/SUCCESS',
      FAILURE: 'TEST/ACTION/FAILURE',
      CLEAN: 'TEST/ACTION/CLEAN'
    });
  });

  it('defines a call function', () => {
    const call = actions.call('arg');

    expect(call).to.deep.include({
      batch: false,
      type: 'TEST/ACTION/CALL',
      meta: { id: ID, type: 'ACTION/CALL' }
    });
    expect(Object.keys(call.payload)).to.deep.equal(['fn']);
    expect(call.payload.fn).to.be.instanceOf(Function);
  });

  it('defines a reset function', () => {
    expect(actions.reset()).to.deep.equal({
      batch: false,
      type: 'TEST/ACTION/RESET',
      meta: { id: ID, type: 'ACTION/RESET' }
    });
  });

  it('defines a cancel function', () => {
    expect(actions.cancel()).to.deep.equal({
      batch: false,
      type: 'TEST/ACTION/CANCEL',
      meta: { id: ID, type: 'ACTION/CANCEL' }
    });
  });

  it('defines a clean function', () => {
    expect(actions.clean()).to.deep.equal({
      batch: false,
      type: 'TEST/ACTION/CLEAN',
      meta: { id: ID, type: 'ACTION/CLEAN' }
    });
  });
});
