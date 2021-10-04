import nodeResolve from '@rollup/plugin-node-resolve';
import html from '@web/rollup-plugin-html';

export default {
  input: 'html/index.html',
  output: {
    entryFileNames: '[hash].js',
    chunkFileNames: '[hash].js',
    assetFileNames: '[hash][extname]',
    format: 'es',
    dir: 'dist',
  },
  preserveEntrySignatures: false,

  plugins: [
    /** Enable using HTML as rollup entrypoint */
    html(),
    /** Resolve bare module imports */
    nodeResolve(),
  ],
};
