const {dirname} = require('path');
const {fileURLToPath} = require('url');
const {FlatCompat} = require('@eslint/eslintrc');

const compat = new FlatCompat({
    baseDirectory: __dirname
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')
];

module.exports = eslintConfig;