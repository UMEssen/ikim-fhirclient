import type { MockSearchQuery } from 'tests/mock_client';
import { describe, expect, test } from 'vitest';

import {
	contains,
	exact,
	greaterThan,
	lessThan,
	multipleAnd,
	notEqual,
	quantity,
	reference,
	token,
} from '@';
import { searchQueryToParams } from '@/search/querycompiler';

describe('basic query elements', () => {
	test('raw params', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			rawParams: {
				name: 'Kirill',
				'family:contains': 'Sokol',
			},
		};
		const output = searchQueryToParams(query);
		expect(output.toString()).toBe('name=Kirill&family%3Acontains=Sokol');
	});

	test('raw params mixin', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			searchParameters: {
				name: 'Kirill',
			},
			rawParams: {
				'family:contains': 'Sokol',
			},
		};
		const output = searchQueryToParams(query);
		expect(output.toString()).toBe('name=Kirill&family%3Acontains=Sokol');
	});
	test('raw search string', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			rawUrl: '_customOffset=0xDEADBEEF#should_ignore',
		};
		expect(() => searchQueryToParams(query)).toThrowError(
			'raw uri should not be used to extract query parameters!',
		);
	});

	test('basic modifier', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			searchParameters: {
				family: contains('Sokol'),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('family:contains')).toBe('Sokol');
	});
	test('multiple and', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			searchParameters: {
				given: multipleAnd('Marc', 'Uwe'),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.getAll('given')).toStrictEqual(['Marc', 'Uwe']);
	});
	test('multiple or', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			searchParameters: {
				given: ['Kirill', 'Andreevich'],
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('given')).toBe('Kirill,Andreevich');
	});
	test('multiple_and & modifiers', () => {
		const query: MockSearchQuery<'Patient'> = {
			resourceType: 'Patient',
			searchParameters: {
				given: multipleAnd(contains('Foo'), exact('FooBar')),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('given:contains')).toBe('Foo');
		expect(output.get('given:exact')).toBe('FooBar');
	});
});

describe('query datatypes', () => {
	test('date', () => {
		const query: MockSearchQuery<'Encounter'> = {
			resourceType: 'Encounter',
			searchParameters: {
				date: new Date('2024-12-18T15:04:00'),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('date')).toBe('2024-12-18');
	});
	test('quantity', () => {
		const queryBasic: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				valueQuantity: 10,
			},
		};
		const outputBasic = searchQueryToParams(queryBasic);
		expect(outputBasic.get('value-quantity')).toBe('10');

		const queryPrefix: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				valueQuantity: greaterThan(10),
			},
		};
		const outputPrefix = searchQueryToParams(queryPrefix);
		expect(outputPrefix.get('value-quantity')).toBe('gt10');

		const queryUnit: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				valueQuantity: quantity(10, 'http://unitsofmeasure.org', 'mg'),
			},
		};
		const outputUnit = searchQueryToParams(queryUnit);
		expect(outputUnit.get('value-quantity')).toBe(
			'10|http://unitsofmeasure.org|mg',
		);

		const queryJustUnit: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				valueQuantity: quantity(10, 'mg'),
			},
		};
		const outputJustUnit = searchQueryToParams(queryJustUnit);
		expect(outputJustUnit.get('value-quantity')).toBe('10||mg');
	});

	test('prefix', () => {
		{
			const query: MockSearchQuery<'Observation'> = {
				resourceType: 'Observation',
				searchParameters: {
					valueQuantity: multipleAnd(greaterThan(0), lessThan(10)),
				},
			};
			const output = searchQueryToParams(query);
			expect(output.getAll('value-quantity')).toStrictEqual(['gt0', 'lt10']);
		}
		{
			const query: MockSearchQuery<'Observation'> = {
				resourceType: 'Observation',
				searchParameters: {
					valueQuantity: [notEqual(10), notEqual(11)],
				},
			};
			const output = searchQueryToParams(query);
			expect(output.get('value-quantity')).toStrictEqual('ne10,ne11');
		}
	});
	test('token', () => {
		const query: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				code: token('http://loinc.org', '48018-6'),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('code')).toBe('http://loinc.org|48018-6');

		const queryNoSys: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				code: '48018-6',
			},
		};
		const outputNoSys = searchQueryToParams(queryNoSys);
		expect(outputNoSys.get('code')).toBe('48018-6');
	});
	test('usecase bodyheight', () => {
		const query: MockSearchQuery<'Observation'> = {
			resourceType: 'Observation',
			searchParameters: {
				code: token('http://snomed.info/sct', '248337003'),
				valueQuantity: multipleAnd(
					greaterThan(quantity(160, 'cm')),
					lessThan(quantity(180, 'cm')),
				),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.getAll('value-quantity')).toStrictEqual([
			'gt160||cm',
			'lt180||cm',
		]);
		expect(output.get('code')).toBe('http://snomed.info/sct|248337003');
	});
	test('reference', () => {
		const query: MockSearchQuery<'Encounter'> = {
			resourceType: 'Encounter',
			searchParameters: {
				partOf: reference('Encounter', 'foobar'),
			},
		};
		const output = searchQueryToParams(query);
		expect(output.get('part-of')).toBe('Encounter/foobar');
	});
});
