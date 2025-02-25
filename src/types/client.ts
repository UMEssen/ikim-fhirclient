import type { fhirclient } from "fhirclient/lib/types";

import type { BaseResource, SearchParamsLookup } from "@";

export type ClientTypeOptions<
  ResourceTypes extends string,
  Resources extends BaseResource<ResourceTypes>,
  SearchParameters extends SearchParamsLookup<ResourceTypes>,
> = {
  resourceTypes: ResourceTypes;
  resources: Resources;
  searchParameters: SearchParameters;
};

type BaseResourceTypes = "OperationOutcome" | "Bundle" | string;
export type BaseClientTypeOptions = ClientTypeOptions<
  BaseResourceTypes,
  BaseResource<BaseResourceTypes>,
  SearchParamsLookup<BaseResourceTypes>
>;

export interface ClientOptions extends Partial<fhirclient.ClientState> {
  serverUrl: string;
  searchParamOverride?: Record<string, string>;
}
