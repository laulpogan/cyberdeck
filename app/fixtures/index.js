// One model per component, frozen. The dark variant of any model is
// derived by setPath in the registry -- there is no second literal
// anywhere in this directory, which is what keeps the measured and the
// unmeasured worlds from drifting apart.

import { field } from './field.js';
import { river } from './river.js';
import { telegraph } from './telegraph.js';
import { thread } from './thread.js';
import { organism } from './organism.js';
import { decision } from './decision.js';
import { agents } from './agents.js';
import { standalone } from './standalone.js';

export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export const FIXTURES = deepFreeze({
  ...field, ...river, ...telegraph, ...thread,
  ...organism, ...decision, ...agents, ...standalone,
});
