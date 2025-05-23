# FHIR Client

TypeScript FHIR client wrapping the [client-js](https://github.com/smart-on-fhir/client-js) library developed at the [IKIM](https://www.ikim.uk-essen.de/).

<img src="./assets/IKIM_logo.jpg" alt="IKIM Logo" width="600"/>

> **Note**: This library is currently in development and not all functionality is available. Any part might be changed or removed without prior notice.

> **Important**: This is a browser-based library designed for use with module bundlers in frontend applications. It is not intended for direct use with browser script tags or in Node.js backends.

## Installation

```bash
yarn add ikim-fhirclient
```

## Usage

```typescript
import { R4Client } from "ikim-fhirclient";

const client = new R4Client({
  serverUrl: "http://hapi.fhir.org/baseR4",
});
```

### Search Operations

Strongly typed search operations with full intellisense support:

```typescript
// Basic search
const patients = await client.search({
  resourceType: "Patient",
  searchParameters: {
    given: "Edward",
    family: "Elric",
  },
});

// Advanced search with tokens and quantities
const observations = await client.search({
  resourceType: "Observation",
  searchParameters: {
    code: token("http://snomed.info/sct", "248337003"),
    valueQuantity: multipleAnd(
      greaterThan(quantity(160, "cm")),
      lessThan(quantity(180, "cm"))
    ),
  },
});
```

### CRUD Operations

```typescript
// Create
const created = await client.create({ resource });

// Read
const resource = await client.read({ resourceType, id });

// Update
const updated = await client.update({ resource });

// Delete
await client.delete({ resourceType, id });
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE)
