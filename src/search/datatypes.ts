/**
 * Search parameter types as defined in FHIR R4
 * @see https://hl7.org/fhir/R4/search.html#Summary
 *
 * Available types:
 * - Number: Search parameter SHALL be a number (whole number or decimal), https://hl7.org/fhir/R4/search.html#number
 * - Date/DateTime: Search parameter is on a date/time in standard XML format, https://hl7.org/fhir/R4/search.html#date
 * - String: Simple string search, case-insensitive and accent-insensitive, https://hl7.org/fhir/R4/search.html#string
 * - Token: Search on coded element or identifier, https://hl7.org/fhir/R4/search.html#token
 * - Reference: A reference to another resource, https://hl7.org/fhir/R4/search.html#reference
 * - Composite: A search parameter that combines multiple values, https://hl7.org/fhir/R4/search.html#composite
 * - Quantity: A search parameter that searches on a quantity, https://hl7.org/fhir/R4/search.html#quantity
 * - URI: A search parameter that searches on a URI (RFC 3986), https://hl7.org/fhir/R4/search.html#uri
 * - Special: Special logic applies to this parameter per description, https://hl7.org/fhir/R4/search.html#special
 */

//https://hl7.org/fhir/R4/search.html#prefix
export type SearchPrefixType =
  | "eq"
  | "ne"
  | "gt"
  | "lt"
  | "ge"
  | "le"
  | "sa"
  | "eb"
  | "ap";

export type SearchTypeNumberInner = number;
export type SearchTypeNumber = SearchPrefixOrValue<SearchTypeNumberInner>;

// TODO: date, dateTime, instant, Peroid, Timing
export type SearchTypeDateInner = Date;
export type SearchTypeDate = SearchPrefixOrValue<SearchTypeDateInner>;

export type SearchTypeString = string;

export type SearchTypeToken =
  | { system?: string; code: string }
  | { system: string; code?: string }
  | string;

export type SearchTypeReference<ResourceTypes extends string> =
  | { resourceType?: ResourceTypes; id: string }
  | { url: string }
  | string;

export type SearchTypeBoolean = boolean;

// TODO: composite
// export type SearchTypeComposite = ???

export type SearchPrefix<T> = {
  prefix: SearchPrefixType;
  prefixValue: T;
};
export type SearchPrefixOrValue<T> = SearchPrefix<T> | T;

export type SearchTypeQuantityInner =
  | {
      number: number;
      system?: string;
      code?: string; // unit
    }
  | number;
export type SearchTypeQuantity = SearchPrefixOrValue<SearchTypeQuantityInner>;

// TODO: should we seperately encode the version part?
// as in https://uk-essen/someSys/someStuff|1.0.0
export type SearchTypeUri = string;

// TODO
// export type SearchTypeSpecial = string

export type SearchType<ResourceTypes extends string> =
  | SearchTypeString
  | SearchTypeDate
  | SearchTypeToken
  | SearchTypeReference<ResourceTypes>
  | SearchTypeQuantity
  | SearchTypeUri
  | SearchTypeNumber
  | SearchTypeBoolean;

// TODO: allow for custom modifiers with typesafety
// https://hl7.org/fhir/R4/search.html#modifiers
export type SearchModifier =
  | {
      modifier: "missing";
      value: SearchTypeBoolean | SearchTypeBoolean[];
    }
  | {
      modifier: "contains";
      value: SearchTypeString | SearchTypeString[];
    }
  | {
      modifier: "exact";
      value: SearchTypeString | SearchTypeString[];
    }
  | {
      modifier: "text";
      value: SearchTypeToken | SearchTypeToken[];
    }
  | {
      modifier: "in";
      value: SearchTypeToken | SearchTypeToken[];
    }
  | {
      modifier: "below";
      value: SearchTypeToken | SearchTypeToken[];
    }
  | {
      modifier: "above";
      value: SearchTypeToken | SearchTypeToken[];
    }
  | {
      modifier: "not";
      value: SearchTypeToken | SearchTypeToken[];
    }
  | {
      modifier: "not-in";
      value: SearchTypeToken | SearchTypeToken[];
    };

export type SearchQuantifier<T> =
  | {
      quantifier: "multiple-and";
      modOrVals: SearchModifierOrValue<T>[];
    }
  | SearchModifierOrValue<T>;
// no explicit multiple-or

export type SearchQuantifierOrModifierOrValue<T> = SearchModifierOrValue<T>;
export type SearchModifierOrValue<T> =
  | T
  | T[]
  | (SearchModifier & { value: T | T[] });

// better alias
export type SearchParameter<T> = SearchQuantifier<T>;
