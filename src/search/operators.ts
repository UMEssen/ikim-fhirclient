import type {
  SearchModifierOrValue,
  SearchPrefix,
  SearchTypeDateInner,
  SearchTypeNumberInner,
  SearchTypeQuantityInner,
  SearchTypeReference,
  SearchTypeString,
  SearchTypeToken,
} from "./datatypes";

export function token(system: string, code?: string): SearchTypeToken;
export function token(code: string): SearchTypeToken;
export function token(systemOrCode: string, code?: string): SearchTypeToken {
  if (code !== undefined) {
    return {
      system: systemOrCode,
      code,
    };
  }
  return {
    system: undefined,
    code: systemOrCode,
  };
}

export function reference<ResType extends string>(
  typeOrRef: ResType | string,
  id?: string,
): SearchTypeReference<ResType> {
  if (id !== undefined) {
    return {
      resourceType: typeOrRef as ResType,
      id,
    };
  }
  if (typeOrRef.includes("/")) {
    const split = typeOrRef.split("/");
    return {
      resourceType: split[0] as ResType,
      id: split[1],
    };
  }
  return {
    id: typeOrRef,
  };
}

export function quantity(
  number: number,
  system: string,
  code: string,
): SearchTypeQuantityInner;
export function quantity(number: number, code: string): SearchTypeQuantityInner;
export function quantity(
  number: number,
  codeOrSystem: string,
  code?: string,
): SearchTypeQuantityInner {
  if (code !== undefined) {
    return {
      number,
      code,
      system: codeOrSystem,
    };
  }
  return {
    code: codeOrSystem,
    number,
  };
}

export function missing(value: boolean): {
  modifier: "missing";
  value: boolean;
} {
  return { modifier: "missing", value };
}
export function contains(value: SearchTypeString): {
  modifier: "contains";
  value: SearchTypeString;
} {
  return { modifier: "contains", value };
}
export function exact(value: SearchTypeString): {
  modifier: "exact";
  value: SearchTypeString;
} {
  return { modifier: "exact", value };
}
export function text(value: SearchTypeToken): {
  modifier: "text";
  value: SearchTypeToken;
} {
  return { modifier: "text", value };
}
export function in_(value: SearchTypeToken): {
  modifier: "in";
  value: SearchTypeToken;
} {
  return { modifier: "in", value };
}
export function below(value: SearchTypeToken): {
  modifier: "below";
  value: SearchTypeToken;
} {
  return { modifier: "below", value };
}
export function above(value: SearchTypeToken): {
  modifier: "above";
  value: SearchTypeToken;
} {
  return { modifier: "above", value };
}

export function not(value: SearchTypeToken): {
  modifier: "not";
  value: SearchTypeToken;
} {
  return { modifier: "not", value };
}

export function notIn(value: SearchTypeToken): {
  modifier: "not-in";
  value: SearchTypeToken;
} {
  return { modifier: "not-in", value };
}

export function multipleAnd<T>(...modOrVals: SearchModifierOrValue<T>[]): {
  quantifier: "multiple-and";
  modOrVals: SearchModifierOrValue<T>[];
} {
  return { quantifier: "multiple-and", modOrVals };
}

// TODO: type can be incorrectly inferred here!
export function multipleOr<T>(
  ...modOrVals: SearchModifierOrValue<T>[]
): SearchModifierOrValue<T>[] {
  return modOrVals;
}

type PrefixInnerType =
  | SearchTypeNumberInner
  | SearchTypeQuantityInner
  | SearchTypeDateInner
  | string; // for date range

/* INFO:
 * TS like to infer types as narrow as possible.
 * PROBLEM EXAMPLE:
 * greaterThan(10) is inferred to SearchPrefix<10>
 * and multipleAnd(greaterThan(10), lessThan(20))
 * is inferred to SearchPrefix<10>
 * and that throws an error.
 * I feel like this is a TS bug, but not sure!
 */
type WidenInner<T> = T extends SearchTypeNumberInner
  ? SearchTypeNumberInner
  : T extends SearchTypeQuantityInner
    ? SearchTypeQuantityInner
    : T extends SearchTypeDateInner
      ? SearchTypeDateInner
      : T;

export function equal<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "eq", prefixValue: value };
}

export function notEqual<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "ne", prefixValue: value };
}

export function greaterThan<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "gt", prefixValue: value };
}

export function lessThan<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "lt", prefixValue: value };
}

export function greaterOrEqual<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "ge", prefixValue: value };
}

export function lessOrEqual<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "le", prefixValue: value };
}

export function startAfter<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "sa", prefixValue: value };
}

export function endBefore<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "eb", prefixValue: value };
}

export function approximate<T extends PrefixInnerType>(
  value: WidenInner<T>,
): SearchPrefix<WidenInner<T>> {
  return { prefix: "ap", prefixValue: value };
}
