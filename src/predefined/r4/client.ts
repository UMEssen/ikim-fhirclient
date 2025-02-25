import type { R4SearchParams } from "./searchparams";

import { FhirClient } from "@/client";
import { SearchBuilder } from "@/search/builderpattern";
import type { ClientTypeOptions } from "@/types/client";
import type { SearchQuery } from "@/types/search";

export type R4TypeOptions = ClientTypeOptions<
  fhir4.FhirResource["resourceType"],
  fhir4.FhirResource,
  R4SearchParams
>;
export class R4Client extends FhirClient<R4TypeOptions> {}

export type R4SearchQuery<ResType extends fhir4.FhirResource["resourceType"]> =
  SearchQuery<R4TypeOptions, ResType>;

export class R4SearchBuilder<
  ResType extends fhir4.FhirResource["resourceType"],
> extends SearchBuilder<R4TypeOptions, ResType> {}
