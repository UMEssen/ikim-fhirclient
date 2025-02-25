import type { fhirclient } from "fhirclient/lib/types";

import type { BaseClientTypeOptions } from "./client";

export interface ReadInput<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
> {
  resourceType: ResType;
  id: string;
  requestOptions?: fhirclient.FetchOptions;
}
