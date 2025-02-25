import type { BaseClientTypeOptions } from "..";

import type { SearchParameter, SearchType } from "@/search/datatypes";

// We want an exhaustive list so we can pattern match
export type BaseBundle =
  | fhir2.Bundle
  | fhir3.Bundle
  | fhir4.Bundle
  | fhir4b.Bundle
  | fhir5.Bundle;

export type BaseOperationOutcome =
  | fhir2.OperationOutcome
  | fhir3.OperationOutcome
  | fhir4.OperationOutcome
  | fhir4b.OperationOutcome
  | fhir5.OperationOutcome;

export type BaseResource<OtherTypes extends string> =
  | BaseBundle
  | BaseOperationOutcome
  | { resourceType: OtherTypes; id?: string };
// same impl, but each is more descriptive for their respective usecase
// so we will keep both

// export type ResourceTypes<TypeOptions extends BaseClientTypeOptions> = Exclude<
//   TypeOptions["resources"]["resourceType"], undefined
// >

// export type ResourceTypes<Resources extends BaseResource> = Exclude<
//   Resources["resourceType"],
//   undefined
// >;
export type ResourceTypeFrom<
  TypeOptions extends BaseClientTypeOptions,
  Resource extends TypeOptions["resources"],
> = Exclude<Resource["resourceType"], undefined>;

export type ResourceFrom<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
> = Extract<TypeOptions["resources"], { resourceType: ResType }>;

// TODO: ResourceFrom<BaseResource, "Bundle"> didn't work since ResType was inferred to string for some reason
export type BundleFrom<TypeOptions extends BaseClientTypeOptions> = Extract<
  TypeOptions["resources"],
  { resourceType: "Bundle" }
>;

// const lol: BundleFrom<BaseResource> = {
//   type: "searchset",
//   resourceType: "Bundle",
// } as {type: "searchset", resourceType: "Bundle"};

// const bar: fhir4.Bundle = lol;

export type OperationOutcomeFrom<TypeOptions extends BaseClientTypeOptions> =
  Extract<TypeOptions["resources"], { resourceType: "OperationOutcome" }>;

export type SearchParamsLookup<ResTypes extends string> = Record<
  ResTypes,
  Partial<Record<string, SearchParameter<SearchType<ResTypes>>>>
>;
