import type { MockSearchQuery } from "tests/mock_client";
import { describe, expect, test } from "vitest";

import { exact, multipleAnd, token, SearchBuilder } from "@";

describe("search builder pattern", () => {
  test("builder vs tree ", () => {
    const treeQuery: MockSearchQuery<"Patient"> = {
      resourceType: "Patient",
      usingPost: true,
      pageLimit: 10,
      searchParameters: {
        name: multipleAnd(exact("Marc"), exact("Uwe")),
        identifier: token("https://foo.bar", "1234"),
      },
    };
    const builtQuery = new SearchBuilder("Patient")
      .set("name", multipleAnd(exact("Marc"), exact("Uwe")))
      .set("identifier", token("https://foo.bar", "1234"))
      .pageLimit(10)
      .usingPost()
      .build();
    expect(builtQuery).toStrictEqual(treeQuery);
  });
});
