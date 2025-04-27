import type { R5SearchParams } from './searchparams';

import { FhirClient } from '@/client';
import { SearchBuilder } from '@/search/builderpattern';
import type { ClientTypeOptions } from '@/types/client';
import type { SearchQuery } from '@/types/search';

export type R5TypeOptions = ClientTypeOptions<
	fhir5.FhirResource['resourceType'],
	fhir5.FhirResource,
	R5SearchParams
>;
export class R5Client extends FhirClient<R5TypeOptions> {}
export type R5SearchQuery<ResType extends fhir5.FhirResource['resourceType']> =
	SearchQuery<R5TypeOptions, ResType>;

export class R5SearchBuilder<
	ResType extends fhir5.FhirResource['resourceType'],
> extends SearchBuilder<R5TypeOptions, ResType> {}
