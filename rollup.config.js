import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@web/rollup-plugin-html';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';

export default {
  input: 'demo/index.html',
  output: {
    entryFileNames: '[hash].js',
    chunkFileNames: '[hash].js',
    assetFileNames: '[hash][extname]',
    format: 'es',
    dir: 'dist'
  },
  preserveEntrySignatures: false,
  plugins: [
    copy({
      targets: [
        { src: 'out-tsc', dest: 'docs' },
        { src: 'demo/index.html', dest: 'dist' },
        { src: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js', dest: 'docs/node_modules/@webcomponents/webcomponentsjs' }
      ]
    }),
    /** Enable using HTML as rollup entrypoint */
    commonjs(),
    /** Enable using HTML as rollup entrypoint */
    html(),
    /** Resolve bare module imports */
    nodeResolve(),
    /** Minify JS */
    terser(),
    /** Compile JS to a lower language target */
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: ['last 3 Chrome major versions', 'last 3 Firefox major versions', 'last 3 Edge major versions', 'last 3 Safari major versions'],
            modules: false,
            bugfixes: true
          }
        ]
      ]
    })
  ]
};
