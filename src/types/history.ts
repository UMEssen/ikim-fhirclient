import type { fhirclient } from "fhirclient/lib/types";

import type { BaseClientTypeOptions } from "./client";

export interface HistoryInput<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
> {
  resourceType: ResType;
  id: string;
  historyParams?: Record<string, string>;
  requestOptions?: fhirclient.FetchOptions;
}
