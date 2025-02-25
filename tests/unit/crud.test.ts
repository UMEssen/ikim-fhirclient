import type { Condition, Patient } from "fhir/r4";
import { MockClient } from "tests/mock_client";
import { assert, describe, test } from "vitest";

import { initMockServer } from "../mocks";

describe("crud", () => {
  initMockServer();
  test("read-patient", async () => {
    const client = new MockClient();
    const resp = await client.read({
      resourceType: "Patient",
      id: "id-1",
    });

    assert(resp satisfies Patient);
    assert(resp.id === "id-1");
    assert(resp.resourceType === "Patient");
    assert(resp.active === true);
  });
  test("read-condition", async () => {
    const client = new MockClient();
    const resp = await client.read({
      resourceType: "Condition",
      id: "id-1",
    });

    assert(resp satisfies Condition);
    assert(resp.id === "id-1");
    assert(resp.resourceType === "Condition");
    assert(resp.code?.coding?.[0]?.code === "73211009");
  });
});
