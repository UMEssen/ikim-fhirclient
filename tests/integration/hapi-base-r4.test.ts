import { assert, describe, test, beforeAll, beforeEach } from 'vitest';

import { R4Client } from '../../src';

const serverUrl = 'https://hapi.fhir.org/baseR4';

async function isServerAvailable(url: string): Promise<boolean> {
	try {
		const response = await fetch(url + '/metadata');
		return response.ok;
	} catch (error) {
		return false;
	}
}

describe('hapi-base-r4', () => {
	let client: R4Client;

	beforeAll(async () => {
		client = new R4Client({
			serverUrl,
		});
	});

	beforeEach(async (context) => {
		const available = await isServerAvailable(serverUrl);
		if (!available) {
			context.skip();
			console.warn(`Skipping test: Server ${serverUrl} is not available`);
		}
	});

	test('simple Patient search', async () => {
		const resp = await client.search({
			resourceType: 'Patient',
		});
		if (!resp.success) {
			throw resp.error;
		}

		assert(resp.success);
		assert(resp.bundles.length > 0);
		assert(resp.resources().length > 0);
		assert(resp.nextPage());
	});

	test('simple Pagination', async () => {
		const resp = await client.search({
			resourceType: 'Patient',
			pageLimit: 2,
		});
		if (!resp.success) {
			throw resp.error;
		}
		assert(resp.success);
		assert(resp.bundles.length === 2);
		assert(resp.nextPage());
	});

	test('Pagination with page limit 0', async () => {
		const resp = await client.search({
			resourceType: 'Patient',
			pageLimit: 0,
		});
		assert(resp.success);
		assert(resp.bundles.length === 1);
		assert(resp.total() === 0);
		assert(resp.resources().length === 0);
		assert(!resp.nextPage());
	});

	test('search with includes', async () => {
		const resp = await client.search({
			resourceType: 'Observation',
			searchParameters: {
				_include: 'Observation:subject',
				_count: 100,
			},
		});

		if (!resp.success) {
			throw resp.error;
		}

		assert(resp.success);
		const observations = resp.resources('Observation');
		assert(observations.length > 0, 'Should have at least one Observation');
		assert(observations[0].resourceType === 'Observation');

		const patients = resp.resources('Patient');
		console.log(
			`Found ${observations.length} observations and ${patients.length} included patients`,
		);

		if (patients.length > 0) {
			assert(patients[0].resourceType === 'Patient');
		}
	});

	test('search with POST method', async () => {
		const resp = await client.search({
			resourceType: 'Patient',
			usingPost: true,
			searchParameters: {
				_count: 5,
			},
		});
		if (!resp.success) {
			throw resp.error;
		}
		assert(resp.success);
		assert(resp.resources.length <= 5);
	});

	test('search for non-existent resource', async () => {
		const resp = await client.search({
			resourceType: 'Patient',
			searchParameters: {
				_id: 'non-existent-id-123',
			},
		});
		if (!resp.success) {
			throw resp.error;
		}
		assert(resp.success);
		assert(resp.bundles.length === 1);
		assert(!resp.bundles[0].entry);
		assert(resp.resources().length === 0);
	});
});
