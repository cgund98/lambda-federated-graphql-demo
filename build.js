const { build } = require("esbuild");
const { dependencies } = require('./package.json')

const sharedConfig = {
  bundle: true,
  minify: true,
};

build({
  ...sharedConfig,
  entryPoints: ["src/svc/basic.ts"],
  platform: 'node',
  outfile: "dist/basic/service.js",
  sourcemap: 'inline',
});