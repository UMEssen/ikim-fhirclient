import { describe, expect, test } from 'vitest';

import {
	token,
	reference,
	quantity,
	missing,
	contains,
	exact,
	text,
	in_,
	below,
	above,
	not,
	notIn,
	multipleAnd,
	multipleOr,
	equal,
	notEqual,
	greaterThan,
	lessThan,
	greaterOrEqual,
	lessOrEqual,
	startAfter,
	endBefore,
	approximate,
} from '@/search/operators';

describe('token operators', () => {
	test('token with system and code', () => {
		const result = token('http://system.example', 'code123');
		expect(result).toEqual({
			system: 'http://system.example',
			code: 'code123',
		});
	});

	test('token with code only', () => {
		const result = token('code123');
		expect(result).toEqual({
			system: undefined,
			code: 'code123',
		});
	});
});

describe('reference operators', () => {
	test('reference with type and id', () => {
		const result = reference('Patient', '123');
		expect(result).toEqual({
			resourceType: 'Patient',
			id: '123',
		});
	});

	test('reference with full URL', () => {
		const result = reference('Patient/123');
		expect(result).toEqual({
			resourceType: 'Patient',
			id: '123',
		});
	});

	test('reference with id only', () => {
		const result = reference('123');
		expect(result).toEqual({
			id: '123',
		});
	});
});

describe('quantity operators', () => {
	test('quantity with system and code', () => {
		const result = quantity(100, 'http://unitsofmeasure.org', 'kg');
		expect(result).toEqual({
			number: 100,
			system: 'http://unitsofmeasure.org',
			code: 'kg',
		});
	});

	test('quantity with code only', () => {
		const result = quantity(100, 'kg');
		expect(result).toEqual({
			number: 100,
			code: 'kg',
		});
	});
});

describe('modifier operators', () => {
	test('missing modifier', () => {
		expect(missing(true)).toEqual({ modifier: 'missing', value: true });
	});

	test('contains modifier', () => {
		expect(contains('test')).toEqual({ modifier: 'contains', value: 'test' });
	});

	test('exact modifier', () => {
		expect(exact('test')).toEqual({ modifier: 'exact', value: 'test' });
	});

	test('text modifier', () => {
		expect(text(token('test'))).toEqual({
			modifier: 'text',
			value: { system: undefined, code: 'test' },
		});
	});
});

describe('token modifiers', () => {
	const testToken = token('test-code');

	test('in modifier', () => {
		expect(in_(testToken)).toEqual({ modifier: 'in', value: testToken });
	});

	test('below modifier', () => {
		expect(below(testToken)).toEqual({ modifier: 'below', value: testToken });
	});

	test('above modifier', () => {
		expect(above(testToken)).toEqual({ modifier: 'above', value: testToken });
	});

	test('not modifier', () => {
		expect(not(testToken)).toEqual({ modifier: 'not', value: testToken });
	});

	test('not-in modifier', () => {
		expect(notIn(testToken)).toEqual({ modifier: 'not-in', value: testToken });
	});
});

describe('multiple value operators', () => {
	test('multipleAnd operator', () => {
		const values = [token('code1'), token('code2')];
		expect(multipleAnd(...values)).toEqual({
			quantifier: 'multiple-and',
			modOrVals: values,
		});
	});

	test('multipleOr operator', () => {
		const values = [token('code1'), token('code2')];
		expect(multipleOr(...values)).toEqual(values);
	});
});

describe('prefix operators', () => {
	test('number prefix operators', () => {
		expect(equal(10)).toEqual({ prefix: 'eq', prefixValue: 10 });
		expect(notEqual(10)).toEqual({ prefix: 'ne', prefixValue: 10 });
		expect(greaterThan(10)).toEqual({ prefix: 'gt', prefixValue: 10 });
		expect(lessThan(10)).toEqual({ prefix: 'lt', prefixValue: 10 });
		expect(greaterOrEqual(10)).toEqual({ prefix: 'ge', prefixValue: 10 });
		expect(lessOrEqual(10)).toEqual({ prefix: 'le', prefixValue: 10 });
	});

	test('date prefix operators', () => {
		const date = '2024-01-01';
		expect(startAfter(date)).toEqual({ prefix: 'sa', prefixValue: date });
		expect(endBefore(date)).toEqual({ prefix: 'eb', prefixValue: date });
	});

	test('approximate operator', () => {
		expect(approximate(10)).toEqual({ prefix: 'ap', prefixValue: 10 });
	});

	test('quantity prefix operators', () => {
		const quantityValue = quantity(100, 'kg');
		expect(equal(quantityValue)).toEqual({
			prefix: 'eq',
			prefixValue: quantityValue,
		});
		expect(greaterThan(quantityValue)).toEqual({
			prefix: 'gt',
			prefixValue: quantityValue,
		});
	});
});
