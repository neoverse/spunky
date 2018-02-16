// @flow
import batchReducer from './batchReducer';
import actionReducer from './actionReducer';
import { isBatch, isAction } from '../util/helpers';

export default function (state: Object = {}, action: Object) {
  if (isBatch(action)) {
    return {
      ...state,
      ...batchReducer(state, action)
    };
  } else if (isAction(action)) {
    return {
      ...state,
      ...actionReducer(state, action)
    };
  } else {
    return state;
  }
}
