import tsPlugin from '@typescript-eslint/eslint-plugin';
import * as tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
	{
		files: ['**/*.{ts,tsx}'],
		ignores: ['dist/**'],
		plugins: {
			'@typescript-eslint': tsPlugin,
			import: importPlugin,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: ['./tsconfig.json', './tsconfig.test.json'],
				ecmaVersion: 2022,
				sourceType: 'module',
			},
			globals: {
				// Using specific globals to avoid whitespace issues
				window: false,
				document: false,
				console: false,
				module: false,
				require: false,
				__dirname: false,
				process: false,
				exports: false,
				global: false,
			},
		},
		rules: {
			// TypeScript specific rules
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': [
				'warn',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports' },
			],

			// General best practices
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			eqeqeq: 'error',
			'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint/no-unused-vars
			'no-var': 'error',
			'prefer-const': 'error',
			'no-multiple-empty-lines': ['error', { max: 1 }],
			semi: ['error', 'always'],

			// Import rules
			'import/no-default-export': 'warn',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc' },
				},
			],
		},
	},
];
