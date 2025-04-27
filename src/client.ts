import type { fhirclient } from 'fhirclient/lib/types';

import { BaseClient } from './base-client';
import { CrudModule } from './crud';
import type { FhirInterceptor } from './interceptor';
import { SearchModule } from './search';
import type {
	BaseClientTypeOptions,
	BundleFrom,
	ClientOptions,
	ResourceFrom,
} from './types';
import type { SearchQuery, SearchResponse } from './types/search';

export class FhirClient<TypeOptions extends BaseClientTypeOptions> {
	private readonly baseClient: BaseClient;
	private readonly searchModule: SearchModule<TypeOptions>;
	private readonly crudModule: CrudModule<TypeOptions>;

	constructor(options: ClientOptions, interceptors: FhirInterceptor[] = []) {
		this.baseClient = new BaseClient(options, interceptors);
		this.searchModule = new SearchModule(
			this.baseClient,
			options.searchParamOverride ?? {},
		);
		this.crudModule = new CrudModule(this.baseClient);
	}

	search<ResType extends TypeOptions['resourceTypes']>(
		query: SearchQuery<TypeOptions, ResType>,
		requestOptions?: fhirclient.FetchOptions,
	): Promise<SearchResponse<TypeOptions, ResType>> {
		return this.searchModule.search(query, requestOptions);
	}

	// CRUD Module Methods
	create<R extends TypeOptions['resources']>(params: {
		resource: R;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<R> {
		return this.crudModule.create(params);
	}

	read<ResType extends TypeOptions['resourceTypes']>(params: {
		resourceType: ResType;
		id: string;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<ResourceFrom<TypeOptions, ResType>> {
		return this.crudModule.read(params);
	}

	update<R extends TypeOptions['resources']>(params: {
		resource: R;
		searchParams?: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<R> {
		return this.crudModule.update(params);
	}

	patch<ResType extends TypeOptions['resourceTypes']>(params: {
		resourceType: ResType;
		id: string;
		operations: Array<{
			op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
			path: string;
			value?: any;
			from?: string;
		}>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<ResourceFrom<TypeOptions, ResType>> {
		return this.crudModule.patch(params);
	}

	delete(params: {
		resourceType: string;
		id: string;
		searchParams?: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<void> {
		return this.crudModule.delete(params);
	}

	vread<ResType extends TypeOptions['resourceTypes']>(params: {
		resourceType: ResType;
		id: string;
		version: string;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<ResourceFrom<TypeOptions, ResType>> {
		return this.crudModule.vread(params);
	}

	history(params: {
		resourceType: TypeOptions['resourceTypes'];
		id: string;
		historyParams?: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<BundleFrom<TypeOptions>> {
		return this.crudModule.history(params);
	}

	conditionalCreate<R extends TypeOptions['resources']>(params: {
		resource: R;
		searchParams: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<R> {
		return this.crudModule.conditionalCreate(params);
	}

	conditionalUpdate<R extends TypeOptions['resources']>(params: {
		resource: R;
		searchParams: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<R> {
		return this.crudModule.conditionalUpdate(params);
	}

	conditionalDelete(params: {
		resourceType: TypeOptions['resourceTypes'];
		searchParams: Record<string, string>;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<void> {
		return this.crudModule.conditionalDelete(params);
	}

	exists(params: {
		resourceType: TypeOptions['resourceTypes'];
		id: string;
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<boolean> {
		return this.crudModule.exists(params);
	}

	capabilities(params?: {
		mode?: 'full' | 'normative' | 'terminology';
		requestOptions?: fhirclient.FetchOptions;
	}): Promise<fhirclient.FHIR.CapabilityStatement> {
		return this.crudModule.capabilities(params);
	}
}
