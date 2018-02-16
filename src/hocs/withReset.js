// @flow
import { type ComponentType } from 'react';
import { type Actions } from '../values/types';
import withResponsiveAction, { type ShouldPerform } from './withResponsiveAction';

export default function withReset(
  actions: Actions,
  shouldReload: ShouldPerform,
  options: Object = {}
): (Component: ComponentType<any>) => ComponentType<any> {
  return withResponsiveAction(actions, 'reset', shouldReload, options);
}
