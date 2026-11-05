import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { assertPublicAssets } from '../scripts/check-public-assets.mjs';

function fixture(t) {
  const ownedDirectory = mkdtempSync(join(tmpdir(), 'public-assets-test-'));
  t.after(() => rmSync(ownedDirectory, { recursive: true, force: true }));
  const publicRoot = join(ownedDirectory, 'public');
  mkdirSync(publicRoot);
  return {
    ownedDirectory,
    publicRoot,
    write(name, content = 'synthetic fixture only') {
      const file = join(publicRoot, name);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, content);
      return file;
    },
  };
}

test('allows an original SVG and a public topic summary', (t) => {
  const files = fixture(t);
  files.write('art/diagram.svg', '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" /></svg>');
  files.write('topics.json', JSON.stringify({ topic: 'Visual storytelling', summary: 'Exploring framing and perspective.' }));
  assert.doesNotThrow(() => assertPublicAssets([files.publicRoot]));
});

for (const extension of ['PdF', 'XlSx', 'xLS', 'XlsM', 'OdS', 'DocX', 'PpTx']) {
  test(`rejects a nested ${extension} file without exposing its content`, (t) => {
    const files = fixture(t);
    files.write(`nested/synthetic.${extension}`, 'fixture-content-must-not-be-printed');
    assert.throws(() => assertPublicAssets([files.publicRoot]), (error) => {
      assert.match(error.message, /public[/\\]nested[/\\]synthetic/);
      assert.match(error.message, /confidential document extension/);
      assert.ok(!error.message.includes('fixture-content-must-not-be-printed'));
      assert.ok(!error.message.includes(files.ownedDirectory));
      return true;
    });
  });
}

test('rejects a PDF signature hidden behind another extension', (t) => {
  const files = fixture(t);
  files.write('art/renamed.bin', Buffer.from('synthetic prefix\n%PDF-1.7\nsynthetic payload'));
  assert.throws(() => assertPublicAssets([files.publicRoot]), /raw PDF signature/);
});

for (const mime of [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
]) {
  test(`rejects embedded ${mime}`, (t) => {
    const files = fixture(t);
    files.write('inline.js', `const asset = 'data:${mime};base64,c3ludGhldGlj';`);
    assert.throws(() => assertPublicAssets([files.publicRoot]), /embedded document MIME/);
  });
}

for (const reference of [
  'https://example.invalid/synthetic.PdF?download=1#document',
  '/downloads/synthetic.XLSX',
  'https:\\/\\/example.invalid\\/synthetic.XLSM?download=1',
  '../downloads/synthetic.ods',
  'https://example.invalid/synthetic%2Epdf',
]) {
  test(`rejects a direct document reference: ${reference}`, (t) => {
    const files = fixture(t);
    files.write('links.html', `<a href="${reference}">Resource</a>`);
    assert.throws(() => assertPublicAssets([files.publicRoot]), /direct document reference/);
  });
}

for (const reference of [
  '/workspace/attachments/synthetic',
  '../attachments/synthetic',
  '/workspace/private-curriculum/synthetic',
  '/private/synthetic',
  'sediment://synthetic-reference',
  '/workspace/%61ttachments/synthetic',
]) {
  test(`rejects a private reference: ${reference}`, (t) => {
    const files = fixture(t);
    files.write('links.js', `const resource = '${reference}';`);
    assert.throws(() => assertPublicAssets([files.publicRoot]), /private attachment reference/);
  });
}

for (const targetType of ['file', 'directory', 'missing']) {
  test(`rejects a ${targetType} symlink without following it`, (t) => {
    const files = fixture(t);
    const target = join(files.ownedDirectory, 'synthetic-target');
    if (targetType === 'file') writeFileSync(target, 'safe synthetic text');
    if (targetType === 'directory') mkdirSync(target);
    symlinkSync(target, join(files.publicRoot, 'linked-resource'));
    assert.throws(() => assertPublicAssets([files.publicRoot]), /symbolic link/);
  });
}

test('rejects a symlink supplied as a scan root', (t) => {
  const files = fixture(t);
  const link = join(files.ownedDirectory, 'linked-root');
  symlinkSync(files.publicRoot, link);
  assert.throws(() => assertPublicAssets([link]), /symbolic link/);
});

test('checks a selected output directory as well as source roots', (t) => {
  const files = fixture(t);
  files.write('diagram.svg', '<svg xmlns="http://www.w3.org/2000/svg" />');
  const selectedOutput = join(files.ownedDirectory, 'selected-output');
  mkdirSync(selectedOutput);
  writeFileSync(join(selectedOutput, 'unexpected.bin'), '%PDF-synthetic');
  assert.throws(() => assertPublicAssets([files.publicRoot, selectedOutput]), /selected-output[/\\]unexpected\.bin.*raw PDF signature/);
});

test('permits an omitted optional public directory', (t) => {
  const files = fixture(t);
  assert.doesNotThrow(() => assertPublicAssets([join(files.ownedDirectory, 'not-present')]));
});
