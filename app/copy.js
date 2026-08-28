// Copy-to-use: the exact import, the exact call, the exact model currently
// on screen. The visitor pastes this and gets the specimen they are
// looking at, motion contract and all.

export function copyFor(spec, model) {
  return [
    `import { ${spec.exportName} } from 'cyberdeck-ui/components';`,
    '',
    `container.innerHTML = ${spec.exportName}(${JSON.stringify(model, null, 2)});`,
    '',
    '// once, after all markup lands on the page:',
    'CyberdeckMotion.start();',
  ].join('\n');
}
