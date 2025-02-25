import type { fhirclient } from "fhirclient/lib/types";

import type { BaseClient } from "./base-client";
import type {
  CreateInput,
  ReadInput,
  UpdateInput,
  PatchInput,
  DeleteInput,
  VReadInput,
  HistoryInput,
  BundleFrom,
  BaseClientTypeOptions,
  ResourceFrom,
  BaseResource,
} from "./types";
//import { BaseClientTypeOptions, BaseResource, ResourceFrom } from "dist";

export class CrudModule<TypeOptions extends BaseClientTypeOptions> {
  constructor(private client: BaseClient) {}

  /**
   * Creates a new FHIR resource
   * @see http://hl7.org/fhir/http.html#create
   */
  async create<R extends TypeOptions["resources"]>(
    params: CreateInput<TypeOptions, R>,
  ): Promise<R> {
    const { resource, requestOptions = {} } = params;

    return this.client.request({
      ...requestOptions,
      url: `${resource.resourceType}`,
      method: "POST",
      body: JSON.stringify(resource),
      headers: {
        "content-type": "application/json",
        ...(requestOptions.headers || {}),
      },
    });
  }

  /**
   * Reads a FHIR resource by type and ID
   * @see http://hl7.org/fhir/http.html#read
   */
  async read<ResType extends TypeOptions["resourceTypes"]>(
    params: ReadInput<TypeOptions, ResType>,
  ): Promise<ResourceFrom<TypeOptions, ResType>> {
    const { resourceType, id, requestOptions = {} } = params;

    return this.client.request({
      ...requestOptions,
      url: `${resourceType}/${id}`,
      method: "GET",
    });
  }

  /**
   * Updates an existing FHIR resource
   * @see http://hl7.org/fhir/http.html#update
   */
  async update<R extends TypeOptions["resources"]>(
    params: UpdateInput<TypeOptions, R>,
  ): Promise<R> {
    const { resource, searchParams = {}, requestOptions = {} } = params;
    const baseRes = resource as BaseResource<TypeOptions["resourceTypes"]>;
    if (!baseRes.resourceType) {
      throw new Error("Resource must have an ID to be updated");
    }

    const urlSearchParams = new URLSearchParams(searchParams);

    return this.client.request({
      ...requestOptions,
      url: `${resource.resourceType}/${resource.id}?${urlSearchParams.toString()}`,
      method: "PUT",
      body: JSON.stringify(resource),
      headers: {
        "content-type": "application/json",
        ...(requestOptions.headers || {}),
      },
    });
  }

  /**
   * Patches an existing FHIR resource using JSON Patch
   * @see http://hl7.org/fhir/http.html#patch
   */
  async patch<ResType extends TypeOptions["resourceTypes"]>(
    params: PatchInput<TypeOptions, ResType>,
  ): Promise<ResourceFrom<TypeOptions, ResType>> {
    const { resourceType, id, operations, requestOptions = {} } = params;

    return this.client.request({
      ...requestOptions,
      url: `${resourceType}/${id}`,
      method: "PATCH",
      body: JSON.stringify(operations),
      headers: {
        "content-type": "application/json-patch+json",
        ...(requestOptions.headers || {}),
      },
    });
  }

  /**
   * Deletes a FHIR resource
   * @see http://hl7.org/fhir/http.html#delete
   */
  async delete<ResType extends TypeOptions["resourceTypes"]>(
    params: DeleteInput<TypeOptions, ResType>,
  ): Promise<void> {
    const { resourceType, id, searchParams = {}, requestOptions = {} } = params;

    const urlSearchParams = new URLSearchParams(searchParams);

    await this.client.request({
      ...requestOptions,
      url: `${resourceType}/${id}?${urlSearchParams.toString()}`,
      method: "DELETE",
    });
  }

  /**
   * Performs a version read operation
   * @see http://hl7.org/fhir/http.html#vread
   */
  async vread<ResType extends TypeOptions["resourceTypes"]>(
    params: VReadInput<TypeOptions, ResType>,
  ): Promise<ResourceFrom<TypeOptions, ResType>> {
    const { resourceType, id, version, requestOptions = {} } = params;

    return this.client.request({
      ...requestOptions,
      url: `${resourceType}/${id}/_history/${version}`,
      method: "GET",
    });
  }

  /**
   * Gets the history of a resource
   * @see http://hl7.org/fhir/http.html#history
   */
  async history<ResType extends TypeOptions["resourceTypes"]>(
    params: HistoryInput<TypeOptions, ResType>,
  ): Promise<BundleFrom<TypeOptions>> {
    const {
      resourceType,
      id,
      historyParams = {},
      requestOptions = {},
    } = params;

    const searchParams = new URLSearchParams(historyParams);

    return this.client.request({
      ...requestOptions,
      url: `${resourceType}/${id}/_history?${searchParams.toString()}`,
      method: "GET",
    });
  }

  /**
   * Conditionally creates a new FHIR resource
   * @see http://hl7.org/fhir/http.html#ccreate
   */
  async conditionalCreate<R extends TypeOptions["resources"]>(params: {
    resource: R;
    searchParams: Record<string, string>;
    requestOptions?: fhirclient.FetchOptions;
  }): Promise<R> {
    const { resource, searchParams, requestOptions = {} } = params;

    const urlSearchParams = new URLSearchParams(searchParams);

    return this.client.request({
      ...requestOptions,
      url: `${resource.resourceType}?${urlSearchParams.toString()}`,
      method: "POST",
      body: JSON.stringify(resource),
      headers: {
        "content-type": "application/json",
        ...(requestOptions.headers || {}),
      },
    });
  }

  /**
   * Conditionally updates a FHIR resource
   * @see http://hl7.org/fhir/http.html#cupdate
   */
  async conditionalUpdate<R extends TypeOptions["resources"]>(params: {
    resource: R;
    searchParams: Record<string, string>;
    requestOptions?: fhirclient.FetchOptions;
  }): Promise<R> {
    const { resource, searchParams, requestOptions = {} } = params;

    const urlSearchParams = new URLSearchParams(searchParams);

    return this.client.request({
      ...requestOptions,
      url: `${resource.resourceType}?${urlSearchParams.toString()}`,
      method: "PUT",
      body: JSON.stringify(resource),
      headers: {
        "content-type": "application/json",
        ...(requestOptions.headers || {}),
      },
    });
  }

  /**
   * Conditionally deletes FHIR resources
   * @see http://hl7.org/fhir/http.html#cdelete
   */
  async conditionalDelete(params: {
    resourceType: string;
    searchParams: Record<string, string>;
    requestOptions?: fhirclient.FetchOptions;
  }): Promise<void> {
    const { resourceType, searchParams, requestOptions = {} } = params;

    const urlSearchParams = new URLSearchParams(searchParams);

    await this.client.request({
      ...requestOptions,
      url: `${resourceType}?${urlSearchParams.toString()}`,
      method: "DELETE",
    });
  }

  /**
   * Checks if a resource exists
   * @see http://hl7.org/fhir/http.html#head
   */
  async exists<ResType extends TypeOptions["resourceTypes"]>(
    params: ReadInput<TypeOptions, ResType>,
  ): Promise<boolean> {
    const { resourceType, id, requestOptions = {} } = params;

    try {
      await this.client.request({
        ...requestOptions,
        url: `${resourceType}/${id}`,
        method: "HEAD",
      });
      return true;
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Executes a capabilities check
   * @see http://hl7.org/fhir/http.html#capabilities
   */
  async capabilities(params?: {
    mode?: "full" | "normative" | "terminology";
    requestOptions?: fhirclient.FetchOptions;
  }): Promise<fhirclient.FHIR.CapabilityStatement> {
    const { mode = "full", requestOptions = {} } = params || {};

    return this.client.request({
      ...requestOptions,
      url: "metadata" + (mode !== "full" ? `?mode=${mode}` : ""),
      method: "GET",
    });
  }
}
