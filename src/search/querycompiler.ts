import type { SearchParamsLookup, SearchQuery } from "..";

import type {
  SearchModifierOrValue,
  SearchQuantifier,
  SearchType,
  SearchTypeQuantityInner,
  SearchTypeReference,
  SearchTypeToken,
} from "./datatypes";

import { camelToKebab } from "@/utils";

/* TODO:
 * this is genuinely some of the worst code I've written
 * but there is little room for improvement I think
 * I want the tree to be able to be written with literals and multiple representations
 * which then has to manually check for types by looking at fields or identities
 *
 * TODO:
 * perhaps put everything in a single function and let typescript
 * check for exhaustiveness. There is no compile-time guarantee here!
 */
const typeTransformers: ((type: SearchType<string>) => string | null)[] = [
  // SearchType with a prefix
  (type: SearchType<string>) => {
    if (!(typeof type === "object" && "prefix" in type)) {
      return null;
    }
    const inner = type.prefixValue as SearchType<string>;
    return `${type.prefix}${valToString(inner)}`;
  },
  // SearchTypeString & SearchTypeReference & SearchTypeURI
  (type: SearchType<string>) => {
    if (typeof type !== "string") {
      return null;
    }
    return type;
  },
  // SearchTypeNumber
  (type: SearchType<string>) => {
    if (typeof type !== "number") {
      return null;
    }
    return type.toString();
  },
  // SearchTypeDate
  (type: SearchType<string>) => {
    if (!(type instanceof Date)) {
      return null;
    }
    // spec says xml format aka yyyy-mm-dd
    return xmlDateFormat(type);
  },
  // SearchTypeBoolean
  (type: SearchType<string>) => {
    if (typeof type !== "boolean") {
      return null;
    }
    return type ? "true" : "false";
  },
  // TODO: ugly but good enough
  // SearchTypeQuantity
  (type: SearchType<string>) => {
    if (!(typeof type === "object" && "number" in type)) {
      return null;
    }
    const quant = type as SearchTypeQuantityInner & object;
    return (
      quant.number.toString() +
      (quant.code === undefined && quant.system === undefined
        ? ""
        : `|${quant.system ?? ""}|${quant.code ?? ""}`)
    );
  },
  // SearchTypeReference
  (type: SearchType<string>) => {
    if (!(typeof type === "object" && ("url" in type || "id" in type))) {
      return null;
    }
    const ref = type as SearchTypeReference<string> & object;
    if ("url" in ref) {
      return ref.url;
    } else {
      return (
        (ref.resourceType !== undefined ? `${ref.resourceType}/` : "") + ref.id
      );
    }
  },
  //SearchTypeToken
  (type: SearchType<string>) => {
    if (!(typeof type === "object" && ("system" in type || "code" in type))) {
      return null;
    }
    const token = type as SearchTypeToken & object;
    return (
      (token.system !== undefined ? `${token.system}|` : "") +
      (token.code ?? "")
    );
  },
];

function xmlDateFormat(date: Date): string {
  return date.toISOString().split("T")[0];
}

function valToString(val: SearchType<string>): string {
  for (const transformer of typeTransformers) {
    const result = transformer(val);
    if (result !== null) return result;
  }
  throw Error(
    `failed to determine string representation for ${JSON.stringify(val)}`,
  );
}

// [Modifier?, Value(s)]
function modOrValToParam(
  modOrVal: SearchModifierOrValue<SearchType<string>>,
): [string | undefined, string[]] {
  // TODO: cast indicates an error here
  let modifier: string | undefined;
  let types: SearchType<string>[];
  // Modifier
  if (typeof modOrVal === "object" && "modifier" in modOrVal) {
    modifier = modOrVal.modifier;
    types = Array.isArray(modOrVal.value) ? modOrVal.value : [modOrVal.value];
  } else {
    types = Array.isArray(modOrVal) ? modOrVal : [modOrVal];
  }
  return [modifier, types.map(valToString)];
}

// typescript is not great at tuples, so here a mini struct
type QuantifierIntermediate = {
  modifier?: string;
  value: string;
};
function searchQuantifierToParam(
  quant: SearchQuantifier<SearchType<string>>,
): QuantifierIntermediate[] {
  if (
    typeof quant === "object" &&
    "quantifier" in quant &&
    quant.quantifier === "multiple-and"
  ) {
    return quant.modOrVals.flatMap(searchQuantifierToParam);
  }
  // TODO: why is this not infered correctly. Probably a bug on my side!!!!
  const [modifier, values] = modOrValToParam(
    quant as SearchModifierOrValue<SearchType<string>>,
  );

  return [
    {
      modifier,
      value: values.join(","),
    },
  ];
}

function searchQueryToParamsTree<ResType extends string>(
  params: SearchParamsLookup<ResType>,
  overrides: Record<string, string>,
): URLSearchParams {
  const urlParams = new URLSearchParams();
  Object.entries(params)
    .map(
      ([key, quant]) =>
        [overrides[key] ?? camelToKebab(key), quant] as [
          string,
          SearchQuantifier<SearchType<string>>,
        ],
    )
    .map(
      ([key, quant]) =>
        [key, searchQuantifierToParam(quant)] as [
          string,
          QuantifierIntermediate[],
        ],
    )
    .flatMap(([key, entries]) =>
      entries.map((e) => [key, e] as [string, QuantifierIntermediate])
    )
    .map(
      ([key, { modifier, value }]) =>
        [key + (modifier !== undefined ? ":" + modifier : ""), value] as [
          string,
          string,
        ],
    )
    .forEach(([key, value]) => urlParams.append(key, value));
  return urlParams;
}

// overlaps will be duplicated!
function combineUrlParams(
  a: URLSearchParams,
  b: URLSearchParams,
): URLSearchParams {
  const acc = new URLSearchParams();
  [...a.entries(), ...b.entries()]
    .forEach(([k, v]) => acc.append(k, v));
  return acc;
}

function searchQueryToParamsRaw(
  parameters: Record<string, string | string[]>,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(parameters)
    .flatMap(([k, v]) => (Array.isArray(v) ? v.map((e) => [k, e]) : [[k, v]]))
    .forEach(([k, v]) => params.append(k, v));
  return params;
}

export function searchQueryToParams(
  query: SearchQuery<any, string>,
  overrides?: Record<string, string>,
): URLSearchParams {
  if ("rawUrl" in query) {
    throw Error("raw uri should not be used to extract query parameters!");
  }
  const rawParams = searchQueryToParamsRaw(query.rawParams ?? {});
  const compiledParams = searchQueryToParamsTree(
    query.searchParameters ?? {},
    overrides ?? {},
  );
  return combineUrlParams(compiledParams, rawParams);
}
