import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const confidentialExtension = /\.(?:pdf|xlsx|xls|xlsm|ods|docx|pptx)$/i;
const documentReference = /\.(?:pdf|xlsx|xls|xlsm|ods|docx|pptx)(?=$|[\s<>"'`?#)\]},;])/i;
const documentMime = /application\/(?:pdf\b|vnd\.ms-excel\b|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet\b|vnd\.oasis\.opendocument\.spreadsheet\b|(?:x-)?msexcel\b|x-excel\b)/i;
const privateReference = /(?:\bsediment\s*:\s*\/\/|(?:^|[\s<>"'`(=:./\\])(?:attachments?|private(?:-curriculum)?)(?:\/|\\|\b\s*:\s*\/\/))/i;

function readableText(bytes) {
  return bytes.toString('utf8')
    .replace(/\\\//g, '/')
    .replace(/(?:%[a-f\d]{2})+/gi, (encoded) => {
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    });
}

/** Reject private source documents and references before they can be published. */
export function assertPublicAssets(roots) {
  for (const root of roots) {
    const absoluteRoot = resolve(root);
    const rootLabel = basename(absoluteRoot);

    function reject(file, rule) {
      const insideRoot = relative(absoluteRoot, file);
      const label = insideRoot ? join(rootLabel, insideRoot) : rootLabel;
      throw new Error(`Public asset check failed: ${JSON.stringify(label)} — ${rule}`);
    }

    function visit(file, optional = false) {
      let stat;
      try {
        stat = lstatSync(file);
      } catch (error) {
        if (optional && error.code === 'ENOENT') return;
        reject(file, 'cannot inspect asset');
      }

      if (stat.isSymbolicLink()) reject(file, 'symbolic link');
      if (confidentialExtension.test(file)) reject(file, 'confidential document extension');
      if (stat.isDirectory()) {
        let entries;
        try {
          entries = readdirSync(file).sort();
        } catch {
          reject(file, 'cannot inspect directory');
        }
        for (const entry of entries) visit(join(file, entry));
        return;
      }
      if (!stat.isFile()) reject(file, 'unsupported asset type');

      let bytes;
      try {
        bytes = readFileSync(file);
      } catch {
        reject(file, 'cannot read asset');
      }
      if (bytes.includes(Buffer.from('%PDF-'))) reject(file, 'raw PDF signature');

      const text = readableText(bytes);
      if (documentMime.test(text)) reject(file, 'embedded document MIME');
      if (privateReference.test(text)) reject(file, 'private attachment reference');
      if (documentReference.test(text)) reject(file, 'direct document reference');
    }

    // A repository may omit public/; nested missing or unreadable entries fail.
    visit(absoluteRoot, true);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const roots = process.argv.slice(2);
    assertPublicAssets(roots.length ? roots : ['src', 'public', 'index.html']);
    console.log('Public asset check passed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
