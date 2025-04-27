import { fhirclient } from 'fhirclient/lib/types';
import type {
	BaseClientTypeOptions,
	SearchParameter,
	SearchParamsLookup,
	SearchType,
	SearchTypeReference,
} from '..';

import type { BundleFrom, OperationOutcomeFrom, ResourceFrom } from './fhir';

export type SearchQuery<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> = {
	resourceType: ResType;
	usingPost?: boolean;
	pageLimit?: number;
	requestOptions?: fhirclient.RequestOptions;
} & (
	| {
			searchParameters?: Partial<TypeOptions['searchParameters'][ResType]>;
			rawParams?: Record<string, string[] | string>;
	  }
	| {
			rawUrl: string;
	  }
);

export type SearchResponse<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> =
	| SearchResponseSuccess<TypeOptions, ResType>
	| SearchResponseFailure<TypeOptions>;

export interface SearchResponseFailure<
	TypeOptions extends BaseClientTypeOptions,
> {
	success: false;
	operationOutcome: OperationOutcomeFrom<TypeOptions>;
	error(): Error;
}

export interface SearchResponseSuccess<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> {
	success: true;
	bundles: BundleFrom<TypeOptions>[];
	nextPage(): SearchQuery<TypeOptions, ResType> | undefined;
	previousPage(): SearchQuery<TypeOptions, ResType> | undefined;
	resources(): ResourceFrom<TypeOptions, ResType>[];
	resources<OtherType extends TypeOptions['resourceTypes']>(
		type: OtherType,
	): ResourceFrom<TypeOptions, OtherType>[];
	total(): number;
	combine(
		other: SearchResponseSuccess<TypeOptions, ResType>,
	): SearchResponseSuccess<TypeOptions, ResType>;
}

export type SearchParameterSubset<
	SuperParameters extends SearchParamsLookup<string>,
	// https://stackoverflow.com/questions/51808160/keyof-inferring-string-number-when-key-is-only-a-string
	SubsetTypes extends keyof SuperParameters & string,
> = {
	[ResType in SubsetTypes]: ReduceReferenceParameters<
		SuperParameters[ResType],
		SubsetTypes
	>;
};

type ReduceReference<
	SP extends SearchParameter<SearchType<string>> | undefined,
	ReducedTypes extends string,
> =
	SP extends SearchParameter<SearchTypeReference<string>>
		? SearchParameter<SearchTypeReference<ReducedTypes>>
		: SP;

type ReduceReferenceParameters<
	LU extends Partial<Record<string, SearchParameter<SearchType<string>>>>,
	ReducedTypes extends string,
> = {
	[K in keyof LU]: ReduceReference<LU[K], ReducedTypes>;
};
