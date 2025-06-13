const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': typescriptEslint
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
            '@typescript-eslint/no-explicit-any': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'no-unused-vars': 'off'
        }
    },
    {
        languageOptions: {
            globals: {
                node: true,
                es2022: true,
                jest: true
            }
        }
    },
    {
        ignores: ['dist/', 'node_modules/', '*.js']
    }
];