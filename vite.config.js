import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { assertPublicAssets } from './scripts/check-public-assets.mjs';

function publicAssetGuard() {
  let config;
  let buildFailed = false;

  return {
    name: 'public-assets-confidentiality',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      if (config.build.sourcemap) {
        throw new Error('Public asset check failed: source maps must remain disabled');
      }
    },
    buildStart() {
      assertPublicAssets([
        resolve(config.root, 'src'),
        ...(config.publicDir ? [config.publicDir] : []),
        resolve(config.root, 'index.html'),
      ]);
    },
    buildEnd(error) {
      buildFailed = Boolean(error);
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        if (!buildFailed && config.build.write !== false) {
          assertPublicAssets([resolve(config.root, config.build.outDir)]);
        }
      },
    },
  };
}

export default defineConfig({
  build: { sourcemap: false },
  plugins: [publicAssetGuard()],
});
