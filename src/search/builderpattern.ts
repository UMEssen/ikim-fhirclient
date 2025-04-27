import type { BaseClientTypeOptions } from '..';

import type { SearchQuery } from '@/types/search';

export class SearchBuilder<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> {
	private query: SearchQuery<TypeOptions, ResType>;
	constructor(resourceType: ResType);
	constructor(resourceType: ResType) {
		this.query = {
			resourceType,
			searchParameters: {},
		};
	}

	build(): SearchQuery<TypeOptions, ResType> {
		return structuredClone(this.query);
	}

	pageLimit(limit: number): SearchBuilder<TypeOptions, ResType> {
		this.query.pageLimit = limit;
		return this;
	}

	usingPost(post?: boolean): SearchBuilder<TypeOptions, ResType> {
		this.query.usingPost = post ?? true;
		return this;
	}

	set<Field extends keyof TypeOptions['searchParameters'][ResType]>(
		field: Field,
		val: Exclude<TypeOptions['searchParameters'][ResType][Field], undefined>,
	): SearchBuilder<TypeOptions, ResType> {
		if (!('searchParameters' in this.query)) {
			throw Error('switched query identity somehow');
		}
		this.query.searchParameters![field] = val;
		return this;
	}
}
