import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
// import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    plugins: [
      json(),
      resolve(),
      commonjs({
        exclude: ['./src/**'],
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ]
  }
];