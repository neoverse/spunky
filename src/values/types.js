// @flow
export type Progress = 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';

export type ActionType =
  'ACTION/CALL' | 'ACTION/CANCEL' | 'ACTION/SUCCESS' | 'ACTION/FAILURE' | 'ACTION/RESET' | 'ACTION/CLEAN' |
  'BATCH/CALL' | 'BATCH/CANCEL' | 'BATCH/SUCCESS' | 'BATCH/FAILURE' | 'BATCH/RESET' | 'BATCH/CLEAN';

export type Data = ?Object;
export type Error = ?string;
export type Payload = any;

export type ActionTypeMap = {
  CALL: string,
  CANCEL: string,
  SUCCESS: string,
  FAILURE: string,
  RESET: string,
  CLEAN: string
};

export type ActionName = 'call' | 'cancel' | 'reset' | 'clean';

export type Actions = {
  id: string,
  batch: boolean,
  actionTypes: ActionTypeMap,
  actions?: {
    [name: string]: Actions
  },
  [name: ActionName]: Function
};

export type ActionMeta = {
  id: string,
  type: ActionType
};

export type ActionMapping = {
  [key: string]: ActionState // eslint-disable-line no-use-before-define
};

export type ActionState = {
  type: string,
  meta: ActionMeta,
  payload?: Payload
};

export type ActionStateMap = {
  [key: string]: ActionState
};
