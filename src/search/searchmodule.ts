import { fhirclient } from "fhirclient/lib/types";
import type {
  BaseClientTypeOptions,
  BundleFrom,
  OperationOutcomeFrom,
  SearchQuery,
  SearchResponse,
  SearchResponseSuccess,
} from "..";
import type { BaseClient } from "../base-client";

import type { SearchBuilder } from "./builderpattern";
import { searchQueryToParams } from "./querycompiler";
import { searchResponseFromResult } from "./searchresponse";

export class SearchModule<TypeOptions extends BaseClientTypeOptions> {
  constructor(
    private client: BaseClient,
    private paramOverride: Record<string, string>
  ) {}

  private async searchRaw<ResType extends TypeOptions["resourceTypes"]>(
    query: SearchQuery<TypeOptions, ResType>,
    requestOptions?: fhirclient.FetchOptions
  ): Promise<BundleFrom<TypeOptions> | OperationOutcomeFrom<TypeOptions>> {
    // if rawUrl is provided, just use it and ignore the rest of the query
    // In particular, I hope will this will fix pagination with other servers
    // e.g. hapi does not include the resource type in the next link
    if ("rawUrl" in query && query.rawUrl !== undefined) {
      return await this.client.request<
        BundleFrom<TypeOptions> | OperationOutcomeFrom<TypeOptions>
      >({
        url: query.rawUrl.toString(),
        ...requestOptions,
      });
    }
    const params: URLSearchParams = searchQueryToParams(
      query,
      this.paramOverride
    );

    const suffix = !!query.usingPost ? "/_search" : `?${params.toString()}`;
    const url = `${query.resourceType}${suffix}`;

    const body = !!query.usingPost ? params : undefined;
    return await this.client.request<
      BundleFrom<TypeOptions> | OperationOutcomeFrom<TypeOptions>
    >({
      url,
      method: query.usingPost ? "POST" : "GET",
      body,
      ...requestOptions,
    });
  }

  private async searchRec<ResType extends TypeOptions["resourceTypes"]>(
    resourceType: ResType,
    query: SearchQuery<TypeOptions, ResType> | undefined,
    acc: SearchResponseSuccess<TypeOptions, ResType> | undefined,
    pages: number,
    requestOptions?: fhirclient.FetchOptions
  ): Promise<SearchResponse<TypeOptions, ResType>> {
    if (pages <= 0 || query === undefined) {
      // done, return accumulated results
      const emptyBundle = {
        resourceType: "Bundle",
        type: "searchset",
      } as BundleFrom<TypeOptions>;
      return (
        acc ??
        searchResponseFromResult<TypeOptions, ResType>(
          resourceType,
          emptyBundle
        )
      );
    }
    // get the next page
    const response = searchResponseFromResult(
      resourceType,
      await this.searchRaw(query, requestOptions)
    );

    if (!response.success) {
      // Failure Response
      return response;
    }

    // tailcall
    return this.searchRec(
      resourceType,
      response.nextPage(),
      acc?.combine(response) ?? response,
      pages - 1
    );
  }

  async search<ResType extends TypeOptions["resourceTypes"]>(
    initialQuery: SearchQuery<TypeOptions, ResType>,
    requestOptions?: fhirclient.FetchOptions
  ): Promise<SearchResponse<TypeOptions, ResType>>;

  async search<ResType extends TypeOptions["resourceTypes"]>(
    initialQuery: SearchBuilder<TypeOptions, ResType>,
    requestOptions?: fhirclient.FetchOptions
  ): Promise<SearchResponse<TypeOptions, ResType>>;

  async search<ResType extends TypeOptions["resourceTypes"]>(
    queryOrBuilder:
      | SearchQuery<TypeOptions, ResType>
      | SearchBuilder<TypeOptions, ResType>,
    requestOptions?: fhirclient.FetchOptions
  ): Promise<SearchResponse<TypeOptions, ResType>> {
    const initialQuery =
      "build" in queryOrBuilder ? queryOrBuilder.build() : queryOrBuilder;
    return this.searchRec(
      initialQuery.resourceType,
      initialQuery,
      undefined,
      initialQuery.pageLimit ?? 1,
      requestOptions
    );
  }
}
