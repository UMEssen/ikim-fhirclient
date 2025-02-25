import type { fhirclient } from "fhirclient/lib/types";

export type FhirRequest = {
  requestOptions: fhirclient.RequestOptions;
  fhirOptions: fhirclient.FhirOptions;
};

export type FhirInterceptor =
  | { type: "request"; callback: FhirRequestInterceptor }
  | { type: "response"; callback: FhirResponseInterceptor };
export type FhirRequestInterceptor = (req: FhirRequest) => FhirRequest;
export type FhirResponseInterceptor = (resp: Response) => void;
