import type { R4BSearchParams } from './searchparams';

import { FhirClient } from '@/client';
import { SearchBuilder } from '@/search/builderpattern';
import type { ClientTypeOptions } from '@/types/client';
import type { SearchQuery } from '@/types/search';

export type R4BTypeOptions = ClientTypeOptions<
	fhir4b.FhirResource['resourceType'],
	fhir4b.FhirResource,
	R4BSearchParams
>;
export class R4BClient extends FhirClient<R4BTypeOptions> {}
export type R4BSearchQuery<
	ResType extends fhir4b.FhirResource['resourceType'],
> = SearchQuery<R4BTypeOptions, ResType>;
export class R4BSearchBuilder<
	ResType extends fhir4b.FhirResource['resourceType'],
> extends SearchBuilder<R4BTypeOptions, ResType> {}
