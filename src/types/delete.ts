import type { fhirclient } from "fhirclient/lib/types";

import type { BaseClientTypeOptions } from "./client";

export interface DeleteInput<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
> {
  resourceType: ResType;
  id: string;
  searchParams?: Record<string, string>;
  requestOptions?: fhirclient.FetchOptions;
}
