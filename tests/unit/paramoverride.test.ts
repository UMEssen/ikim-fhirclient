import { describe, expect, it } from 'vitest';

import { exact, greaterThan, lessThan, multipleAnd } from '@/index';
import { searchQueryToParams } from '@/search/querycompiler';

describe('search parameter overrides', () => {
	it('should honor overrides', () => {
		const params = searchQueryToParams(
			{
				resourceType: 'Patient',
				searchParameters: {
					_fooBar: '1234',
				},
			},
			{
				_fooBar: '_fooBar',
			},
		);
		expect([...params.keys()]).toStrictEqual(['_fooBar']);
		expect(params.get('_fooBar')).toBe('1234');
	});

	it('should change to kebab for non specified keys', () => {
		const params = searchQueryToParams(
			{
				resourceType: 'Patient',
				searchParameters: {
					someSearchParam: 'lolz',
					_fooBar: '1234',
				},
			},
			{
				_fooBar: '_fooBar',
			},
		);
		expect([...params.keys()]).toStrictEqual(['some-search-param', '_fooBar']);
	});

	it('should handle complex usecase', () => {
		const params = searchQueryToParams(
			{
				resourceType: 'Patient',
				searchParameters: {
					_fooBar: multipleAnd(greaterThan(1), lessThan(10)),
					lolCat: exact('lolcat'),
				},
			},
			{
				_fooBar: '_fooBar',
				lolCat: 'lol',
			},
		);
		expect([...params.keys()]).toStrictEqual([
			'_fooBar',
			'_fooBar',
			'lol:exact',
		]);
	});
});
