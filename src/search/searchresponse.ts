import type {
  BaseBundle,
  BaseClientTypeOptions,
  BaseOperationOutcome,
  BundleFrom,
  OperationOutcomeFrom,
  ResourceFrom,
  SearchResponse,
  SearchResponseFailure,
  SearchResponseSuccess,
} from "@";
import type { SearchQuery } from "@/types/search";

class SearchResponseSuccessImpl<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
> implements SearchResponseSuccess<TypeOptions, ResType>
{
  success: true;
  resourceType: ResType; // the primary type

  // we consider multiple bundles
  // so that a search response can be the sum of previous paginations
  // non paginated result will have a single entry;
  bundles: BundleFrom<TypeOptions>[];

  constructor(
    resourceType: ResType,
    bundle: BundleFrom<TypeOptions>[] | BundleFrom<TypeOptions>,
  ) {
    this.success = true;
    this.bundles = Array.isArray(bundle) ? bundle : [bundle];
    this.resourceType = resourceType;
  }

  total(): number {
    return this.resources().length || 0;
  }

  resources<SubType extends TypeOptions["resourceTypes"]>(
    type: SubType,
  ): ResourceFrom<TypeOptions, SubType>[];

  resources(): ResourceFrom<TypeOptions, ResType>[];

  resources<SubType extends TypeOptions["resourceTypes"]>(
    typeOrNone?: SubType,
  ):
    | ResourceFrom<TypeOptions, SubType>[]
    | ResourceFrom<TypeOptions, ResType>[] {
    const resType = typeOrNone ?? this.resourceType;
    const bundles = this.bundles as BaseBundle[];
    return bundles
      .map((b) => b.entry ?? [])
      .flat() // flat map throws an error here, not sure why
      .flatMap((e) =>
        e.resource?.resourceType === resType
          ? [e.resource as ResourceFrom<TypeOptions, SubType>]
          : [],
      );
  }

  combine(
    other: SearchResponseSuccess<TypeOptions, ResType>,
  ): SearchResponseSuccess<TypeOptions, ResType> {
    return new SearchResponseSuccessImpl(this.resourceType, [
      ...this.bundles,
      ...other.bundles,
    ]);
  }

  private xPage(
    x: "next" | "previous",
  ): SearchQuery<TypeOptions, ResType> | undefined {
    const last: BaseBundle | undefined = this.bundles[
      this.bundles.length - 1
    ] as BaseBundle | undefined;
    const nextUri = last?.link?.find((l) => l.relation === x)?.url;
    if (nextUri === undefined) return undefined;
    return {
      resourceType: this.resourceType,
      rawUrl: nextUri,
    };
  }

  previousPage(): SearchQuery<TypeOptions, ResType> | undefined {
    return this.xPage("previous");
  }

  nextPage(): SearchQuery<TypeOptions, ResType> | undefined {
    return this.xPage("next");
  }
}

class SearchResponseFailureImpl<TypeOptions extends BaseClientTypeOptions>
  implements SearchResponseFailure<TypeOptions>
{
  success: false;
  operationOutcome: OperationOutcomeFrom<TypeOptions>;
  constructor(outcome: OperationOutcomeFrom<TypeOptions>) {
    this.success = false;
    this.operationOutcome = outcome;
  }
  error(): Error {
    const oc = this.operationOutcome as BaseOperationOutcome;
    return Error(
      [
        ...(oc.text !== undefined ? [oc.text] : []),
        ...oc.issue
          .flatMap((i) => i.details)
          .filter((cc) => cc !== undefined)
          .map((cc) => cc as Exclude<typeof cc, undefined>)
          .map((cc) => cc.text)
          .filter((txt) => txt !== undefined),
      ].join("\n"),
    );
  }
}

export function searchResponseFromResult<
  TypeOptions extends BaseClientTypeOptions,
  ResType extends TypeOptions["resourceTypes"],
>(
  resType: ResType,
  response: OperationOutcomeFrom<TypeOptions> | BundleFrom<TypeOptions>,
): SearchResponse<TypeOptions, ResType> {
  return response.resourceType === "Bundle"
    ? new SearchResponseSuccessImpl(resType, response)
    : new SearchResponseFailureImpl(response);
}
