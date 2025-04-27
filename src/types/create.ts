import type { fhirclient } from 'fhirclient/lib/types';

import type { BaseClientTypeOptions } from './client';

export interface CreateInput<
	TypeOptions extends BaseClientTypeOptions,
	R extends TypeOptions['resources'],
> {
	resource: R;
	requestOptions?: fhirclient.FetchOptions;
}
