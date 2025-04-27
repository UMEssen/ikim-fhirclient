import type { fhirclient } from 'fhirclient/lib/types';

import type { BaseClientTypeOptions } from './client';

export interface UpdateInput<
	TypeOptions extends BaseClientTypeOptions,
	R extends TypeOptions['resources'],
> {
	resource: R;
	searchParams?: Record<string, string>;
	requestOptions?: fhirclient.FetchOptions;
}
