import type { FhirResource, OperationOutcome } from "fhir/r4";

export function isOperationOutcome(
  resource: FhirResource,
): resource is OperationOutcome {
  return resource.resourceType === "OperationOutcome";
}

export function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export const kebabToCamel = (str: string): string => {
  return str.replace(/-./g, (x) => x[1].toUpperCase());
};
