import { terser } from 'rollup-plugin-terser';

const version = "1.0.0";


export default [
  {
    input: "src/index.js",
    output: {
      file: `dist/otree-web-${version}.js`,
    },
  },
  {
    input: "src/index.js",
    output: {
      file: `dist/otree-web-${version}.min.js`,
    },
    plugins: [terser()]
  }
];
