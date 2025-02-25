import type { MockSearchQuery } from "tests/mock_client";
import { MockClient } from "tests/mock_client";
import { assert, describe, expect, test } from "vitest";

import { initMockServer } from "../../mocks";

import { reference } from "@";
import { searchQueryToParams } from "@/search/querycompiler";

describe("mocked queries", () => {
  initMockServer();
  test("basic query", async () => {
    const client = new MockClient();
    const resp = await client.search({
      resourceType: "Patient",
      searchParameters: {},
    });
    assert(resp.success);
    assert(resp.bundles.length === 1);
    assert(resp.resources.length === 1);
    assert(resp.total() === 1);
  });
  test("raw url", () => {
    const query: MockSearchQuery<"Patient"> = {
      resourceType: "Patient",
      rawUrl:
        "https://some.fhir.server.com/foo/R4/Patient?_customOffset=0xDEADBEEF#should_ignore",
    };
    expect(() => searchQueryToParams(query)).toThrowError(
      "raw uri should not be used to extract query parameters!",
    );
  });

  test("parameters", async () => {
    const client = new MockClient();
    const resp = await client.search({
      resourceType: "Patient",
      searchParameters: {
        given: "Kirill",
        name: "Sokol",
      },
    });
    assert(resp.success);
    // example usage
    const name = resp
      .resources()
      .flatMap((p) => p.name ?? [])
      .find((n) => n.given?.includes("Kirill"));
    assert(name);
  });
  test("pagination single", async () => {
    const client = new MockClient();
    const resp = await client.search({
      resourceType: "Encounter",
      searchParameters: {
        partOf: reference("Encounter", "foobar"),
      },
    });
    assert(resp.success);
    const next = resp.nextPage();
    assert(next);
    const nextResp = await client.search(next);
    assert(nextResp.success);
    expect(nextResp.nextPage()).toBe(undefined);
  });

  test("pagination pageLimit", async () => {
    const client = new MockClient();
    const respLimit2 = await client.search({
      resourceType: "Encounter",
      pageLimit: 2,
      searchParameters: {
        partOf: reference("Encounter", "foobar"),
      },
    });
    assert(respLimit2.success);
    expect(respLimit2.bundles.length).toBe(2);

    const respLimit1 = await client.search({
      resourceType: "Encounter",
      pageLimit: 1,
      searchParameters: {
        partOf: reference("Encounter", "foobar"),
      },
    });
    assert(respLimit1.success);
    expect(respLimit1.bundles.length).toBe(1);

    const respLimit0 = await client.search({
      resourceType: "Encounter",
      pageLimit: 0,
      searchParameters: {
        partOf: reference("Encounter", "foobar"),
      },
    });
    assert(respLimit0.success);
    expect(respLimit0.resources()).toStrictEqual([]);
  });

  test("http method POST", async () => {
    const client = new MockClient();
    const httpResp = await client.search({
      resourceType: "Patient",
      usingPost: true,
      searchParameters: {
        name: "Mustermann",
      },
    });
    assert(httpResp.success);
  });
  test("operation outcome error", async () => {
    const client = new MockClient();
    const resp = await client.search({
      resourceType: "Patient",
      searchParameters: {
        name: "ErrorLol",
      },
    });
    assert(!resp.success);

    // a snippet inside the error that we want to detect
    expect(() => {
      throw resp.error();
    }).toThrow(/.*foobar error.*/g);
  });
  test("get by resource type", async () => {
    const client = new MockClient();
    // the response is a bundle of conditions and patients, thats why we use a union type
    // without the type hint, typescript would assume the resources property to be typed as Condition[].
    // This can be solved by making resources a method and providing the resource type. However,
    // this is somewhat unintuitive and not compatible with the old client. The same behavious is
    // achievable by using the getResourcesByType method.
    const resp = await client.search<"Condition" | "Patient">({
      resourceType: "Condition",
      searchParameters: {
        _include: "Condition:subject",
      },
    });
    if (!resp.success) {
      throw resp.error;
    }
    const conditions = resp.resources("Condition");
    const patients = resp.resources("Patient");
    assert(resp.success);
    assert(resp.total() === 1);
    assert(conditions.length === 1);
    assert(conditions[0].resourceType === "Condition");
    assert(patients.length === 1);
    assert(patients[0].resourceType === "Patient");
  });
});
