import type { ClientTypeOptions, SearchQuery } from '../src';
import { FhirClient } from '../src';

import { mockFhirUrl } from './mocks';

import type { R4SearchParams, SearchParameterSubset } from '@';

type MockResources =
	| fhir4.Patient
	| fhir4.Encounter
	| fhir4.Observation
	| fhir4.Condition
	| fhir4.Bundle
	| fhir4.OperationOutcome;
type MockTypes = MockResources['resourceType'];

type MockSearchParameters = SearchParameterSubset<R4SearchParams, MockTypes>;

export type MockTypeOptions = ClientTypeOptions<
	MockTypes,
	MockResources,
	MockSearchParameters
>;

export class MockClient extends FhirClient<MockTypeOptions> {
	constructor() {
		super({
			serverUrl: mockFhirUrl,
		});
	}
}

export type MockSearchQuery<ResType extends MockTypes> = SearchQuery<
	MockTypeOptions,
	ResType
>;
