#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const THEME_FILE = path.join(ROOT, 'constants', 'theme.ts');
const DEFAULT_OUT = path.join(ROOT, '..', 'pencil-variables.json');

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function readThemeFile() {
  if (!fs.existsSync(THEME_FILE)) {
    fail(`Missing ${THEME_FILE}`);
  }
  return fs.readFileSync(THEME_FILE, 'utf8');
}

function parseColorBlock(source, blockName) {
  const blockRegex = new RegExp(`export\\s+const\\s+${blockName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as\\s+const;`);
  const match = source.match(blockRegex);
  if (!match) fail(`Could not find ${blockName} block in theme.ts`);

  const body = match[1];
  const map = {};
  const lineRegex = /^\s*([A-Za-z0-9_]+):\s*['"]([^'"]+)['"],?\s*$/gm;
  let line;
  while ((line = lineRegex.exec(body)) !== null) {
    map[line[1]] = line[2];
  }
  if (Object.keys(map).length === 0) {
    fail(`No colors parsed from ${blockName}`);
  }

  return { fullMatch: match[0], body, map };
}

function toPencilVariables(darkMap, lightMap) {
  const keys = [...new Set([...Object.keys(darkMap), ...Object.keys(lightMap)])];
  const variables = {};

  for (const key of keys) {
    const dark = darkMap[key];
    const light = lightMap[key];
    if (!dark && !light) continue;

    const values = [];
    if (dark) values.push({ value: dark, theme: { mode: 'dark' } });
    if (light) values.push({ value: light, theme: { mode: 'light' } });

    variables[`color.${key}`] = {
      type: 'color',
      value: values.length === 1 ? values[0].value : values,
    };
  }

  return {
    themes: { mode: ['dark', 'light'] },
    variables,
  };
}

function normalizeIncomingVariables(raw) {
  const vars = raw?.variables;
  if (!vars || typeof vars !== 'object') fail('Input JSON must have a variables object');

  const dark = {};
  const light = {};

  for (const [name, def] of Object.entries(vars)) {
    if (!name.startsWith('color.')) continue;
    if (!def || def.type !== 'color') continue;

    const key = name.slice('color.'.length);
    if (!key) continue;

    if (typeof def.value === 'string') {
      dark[key] = def.value;
      light[key] = def.value;
      continue;
    }

    if (Array.isArray(def.value)) {
      for (const item of def.value) {
        if (!item || typeof item.value !== 'string') continue;
        const mode = item.theme?.mode;
        if (mode === 'dark') dark[key] = item.value;
        if (mode === 'light') light[key] = item.value;
      }
    }
  }

  return { dark, light };
}

function updateBlockBody(body, nextValues) {
  return body.replace(/^(\s*)([A-Za-z0-9_]+)(:\s*['"])([^'"]+)(['"],?\s*)$/gm, (m, indent, key, sep1, oldValue, sep2) => {
    const newValue = nextValues[key];
    if (!newValue) return m;
    return `${indent}${key}${sep1}${newValue}${sep2}`;
  });
}

function runExport(outFile) {
  const src = readThemeFile();
  const dark = parseColorBlock(src, 'DarkColors').map;
  const light = parseColorBlock(src, 'LightColors').map;

  const payload = toPencilVariables(dark, light);
  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Exported ${Object.keys(payload.variables).length} variables to ${outFile}`);
}

function runImport(inFile) {
  if (!fs.existsSync(inFile)) fail(`Missing input file: ${inFile}`);

  const raw = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const incoming = normalizeIncomingVariables(raw);

  const src = readThemeFile();
  const darkBlock = parseColorBlock(src, 'DarkColors');
  const lightBlock = parseColorBlock(src, 'LightColors');

  const mergedDark = { ...darkBlock.map, ...incoming.dark };
  const mergedLight = { ...lightBlock.map, ...incoming.light };

  const updatedDarkBody = updateBlockBody(darkBlock.body, mergedDark);
  const updatedLightBody = updateBlockBody(lightBlock.body, mergedLight);

  const updatedDark = darkBlock.fullMatch.replace(darkBlock.body, updatedDarkBody);
  const updatedLight = lightBlock.fullMatch.replace(lightBlock.body, updatedLightBody);

  let nextSrc = src.replace(darkBlock.fullMatch, updatedDark);
  nextSrc = nextSrc.replace(lightBlock.fullMatch, updatedLight);

  fs.writeFileSync(THEME_FILE, nextSrc, 'utf8');
  console.log(`Imported variables from ${inFile} into ${THEME_FILE}`);
}

function usage() {
  console.log('Usage:');
  console.log('  node scripts/pencil-token-sync.mjs export [outputPath]');
  console.log('  node scripts/pencil-token-sync.mjs import [inputPath]');
}

const cmd = process.argv[2];
const fileArg = process.argv[3];

if (!cmd || (cmd !== 'export' && cmd !== 'import')) {
  usage();
  process.exit(1);
}

if (cmd === 'export') {
  runExport(fileArg ? path.resolve(ROOT, fileArg) : DEFAULT_OUT);
}

if (cmd === 'import') {
  runImport(fileArg ? path.resolve(ROOT, fileArg) : DEFAULT_OUT);
}
