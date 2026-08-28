import { FAMILY_TABLES, NON_COMPONENTS } from './families.js';

/** The import a visitor copies, straight out of `package.json` exports. */
export const IMPORT_PATH = 'cyberdeck-ui/components';

/** Every module the library's components live in, by the path a reader would
 * open. The completeness test walks these and asks, of every exported function,
 * why it is not on a page. */
export const COMPONENT_MODULES = [
  { file: 'src/components/field.js', module: () => import('../../../src/components/field.js') },
  { file: 'src/components/river.js', module: () => import('../../../src/components/river.js') },
  { file: 'src/components/telegraph.js', module: () => import('../../../src/components/telegraph.js') },
  { file: 'src/components/thread.js', module: () => import('../../../src/components/thread.js') },
  { file: 'src/components/organism.js', module: () => import('../../../src/components/organism.js') },
  { file: 'src/components/decision.js', module: () => import('../../../src/components/decision.js') },
  { file: 'src/components/authority.js', module: () => import('../../../src/components/authority.js') },
  { file: 'src/components/agents.js', module: () => import('../../../src/components/agents.js') },
  { file: 'src/components/gauge.js', module: () => import('../../../src/components/gauge.js') },
  { file: 'src/components/globe.js', module: () => import('../../../src/components/globe.js') },
  { file: 'src/components/card.js', module: () => import('../../../src/components/card.js') },
];

export const REGISTRY = FAMILY_TABLES.map((family) => ({
  ...family,
  count: family.components.length,
}));

export function familyBySlug(slug) {
  return REGISTRY.find((family) => family.slug === slug) || null;
}

export function componentByKey(key) {
  for (const family of REGISTRY) {
    const found = family.components.find((component) => component.key === key);
    if (found) return { ...found, family: family.slug, familyName: family.name };
  }
  return null;
}

export function allComponents() {
  return REGISTRY.flatMap((family) => family.components.map((component) => ({
    ...component,
    family: family.slug,
    familyName: family.name,
  })));
}

export const COMPONENT_KEYS = allComponents().map((component) => component.key);

export { NON_COMPONENTS };
