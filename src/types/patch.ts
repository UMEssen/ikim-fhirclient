import type { fhirclient } from 'fhirclient/lib/types';

import type { BaseClientTypeOptions } from './client';

export interface PatchInput<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> {
	resourceType: ResType;
	id: string;
	operations: Array<{
		op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
		path: string;
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		value?: any;
		from?: string;
	}>;
	requestOptions?: fhirclient.FetchOptions;
}
