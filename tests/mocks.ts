import { readdirSync, readFileSync } from "fs";
import { afterEach } from "node:test";
import path from "path";

import type { HttpResponseResolver } from "msw";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll } from "vitest";

/* INFO:
 * mocked responses are read from mock_responses
 * file name is just the uri-escaped query
 */
export const mockFhirUrl = "https://liar.liar.pants-on-fhir.com/r4";
export const mockFhirAuthToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IktpcmlsbCBTb2tvbCIsImlhdCI6MTUxNjIzOTAyMiwiZmllbGQiOiJqd3QgaXMgY29vbCEgSGF2ZSBhIGNvb2tpZSDwn42qIn0.pvgSeDHL7DA93tOCzHF32k95A0cC9HDW5PSNoLy03Aw";

//
/* eslint-disable  @typescript-eslint/no-explicit-any */
type JsonData = any;

function jsonFileContent(path: string): JsonData {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

function unescapeQuery(query: string): string {
  // escape "/"
  return decodeURIComponent(query).replace(/%2F/g, "/");
}

/**
 * Takes a list of [path, data] pairs and returns a lookup table (path -> query -> data)
 */
function partitionByPath(
  entries: [string, JsonData][],
): Record<string, Record<string, JsonData>> {
  const lookup: Record<string, Record<string, JsonData>> = {};
  entries
    .map(
      ([path, data]) =>
        [unescapeQuery(path).split("?"), data] as [
          [string, string | undefined],
          string,
        ],
    )
    .forEach(([[path, query], data]) => {
      lookup[path] = lookup[path] ?? {};
      lookup[path][query ?? ""] = data;
    });
  return lookup;
}

/**
 * Reads the mock responses from the given base path and returns a lookup table
 */
function readMockLookup(
  basePath: string,
): Record<string, Record<string, JsonData>> {
  const lookup = partitionByPath(
    readdirSync(basePath)
      // TODO: this could be async
      .map(
        (fp) =>
          [fp.split(".json")[0], jsonFileContent(path.join(basePath, fp))] as [
            string,
            JsonData,
          ],
      ),
  );
  return lookup;
}
//Condition?_include=Condition%3Asubject
// TODO: support windows? eh
const mockLookup = readMockLookup(
  path.resolve(__dirname, "../tests/mock_responses"),
);

// TODO: refactor
const mockedHandlers = Object.entries(mockLookup).map(([path, queryLookup]) => {
  const callback: HttpResponseResolver = ({ request }) => {
    const u = new URL(request.url);

    const queryRaw = unescapeQuery(u.searchParams.toString());

    const lookupData = queryLookup[queryRaw];
    if (lookupData === undefined)
      throw Error("no defined mock data for " + queryRaw);
    return HttpResponse.json(lookupData);
  };
  const url = `${mockFhirUrl}/${path}`;
  return path.includes("_search")
    ? http.post(url, callback)
    : http.get(url, callback);
});

const mockServer = setupServer(...mockedHandlers);

export function initMockServer() {
  beforeAll(() => mockServer.listen({ onUnhandledRequest: "warn" }));
  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
}
