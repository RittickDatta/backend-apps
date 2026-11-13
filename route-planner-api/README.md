# Route Planner API

A traffic-aware route planning REST API built with **Node.js, Express, and TypeScript**.

The project models a road network as a weighted graph and implements BFS and Dijkstra's algorithm to find routes based on road count, distance, or estimated travel time.

It supports one-way roads, live traffic multipliers, road closures, request validation, and automated tests.

## Features

- Manage intersections and weighted roads
- Represent one-way and bidirectional connections
- Find routes with the fewest roads using BFS
- Find shortest-distance routes using Dijkstra
- Find fastest routes using traffic-adjusted travel times
- Update traffic conditions and road closures
- Automatically recalculate routes using current road conditions
- Validate incoming requests and return structured API errors
- Run automated tests with Node.js and Supertest
- Execute API scenarios with Postman and Newman
- Benchmark routing algorithms on generated road networks

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Algorithms:** BFS, Dijkstra, binary min-heap
- **Storage:** In-memory Maps and adjacency lists
- **Testing:** Node.js test runner, Supertest, Postman, Newman
- **Benchmarking:** Node.js Performance API

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The API runs at `http://localhost:3000` by default.

### Production build

```bash
npm run build
```

Start the compiled server using the project's configured production start script.

## API Endpoints

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |

### Graph Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/intersections` | List intersections |
| POST | `/api/intersections` | Create intersection |
| GET | `/api/intersections/:id` | Get intersection |
| GET | `/api/intersections/:id/neighbors` | Get adjacent intersections |
| GET | `/api/roads` | List roads |
| POST | `/api/roads` | Create road |
| GET | `/api/roads/:id` | Get road |
| PATCH | `/api/roads/:id/traffic` | Update traffic multiplier |
| PATCH | `/api/roads/:id/closure` | Close or reopen road |

### Routing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/routes/bfs?from=A&to=C` | Fewest-road route |
| GET | `/api/routes/optimal?from=A&to=C&metric=distance` | Shortest-distance route |
| GET | `/api/routes/optimal?from=A&to=C&metric=time` | Fastest estimated route |

### Example: Fastest Route

```bash
curl "http://localhost:3000/api/routes/optimal?from=A&to=C&metric=time"
```

Example response for the default seeded graph:

```json
{
  "data": {
    "path": ["A", "B", "C"],
    "roadIds": ["R1", "R2"],
    "metric": "time",
    "totalCost": 10,
    "totalDistanceKm": 5,
    "totalMinutes": 10
  }
}
```

### Example: Update Traffic

```bash
curl -X PATCH \
  "http://localhost:3000/api/roads/R2/traffic" \
  -H "Content-Type: application/json" \
  -d '{"multiplier":3}'
```

The next fastest-route request uses the updated travel time.

### Example: Close a Road

```bash
curl -X PATCH \
  "http://localhost:3000/api/roads/R2/closure" \
  -H "Content-Type: application/json" \
  -d '{"closed":true}'
```

Closed roads are excluded from BFS and Dijkstra.

## Architecture

The project separates HTTP handling, graph storage, and routing algorithms.

```text
src/
├── algorithms/
│   ├── bfs.ts
│   ├── dijkstra.ts
│   └── min-heap.ts
├── graph/
│   ├── graph.repository.ts
│   └── graph.types.ts
├── middleware/
├── routes/
├── data/
├── app.ts
└── server.ts
```

The graph repository stores intersections and roads in Maps and represents connections through adjacency lists.

Express route handlers validate HTTP requests and delegate routing work to independent algorithm functions.

The application factory accepts a graph repository, allowing tests to inject isolated graph instances.

## Algorithms and Complexity

| Algorithm | Optimization | Time | Auxiliary space |
|---|---|---|---|
| BFS | Fewest roads | O(V + E) | O(V) |
| Dijkstra + min-heap | Distance or time | O((V + E) log(V + E)) | O(V + E) |

BFS is appropriate for unweighted routing, while Dijkstra handles nonnegative weighted roads.

Traffic-adjusted travel time is calculated as:

`effectiveMinutes = baseMinutes × trafficMultiplier`

Closed roads are excluded from routing.

## Testing

Run automated tests:

```bash
npm test
```

Run the TypeScript build:

```bash
npm run build
```

Run the Postman collection with Newman while the API server is running:

```bash
npm run test:postman
```

The Postman collection and environment files are located in `postman/`.

## Benchmarking

Run:

```bash
npm run bench
```

The benchmark compares BFS and Dijkstra on deterministic square grid graphs of increasing size.

See [Benchmark Report](docs/BENCHMARKS.md) for methodology, measured results, and limitations.

## Engineering Decisions

**Adjacency lists:** Efficient for sparse road networks and neighbor traversal.

**Binary min-heap:** Supports efficient selection of the next lowest-cost intersection.

**Lazy heap deletion:** Simplifies Dijkstra without implementing decrease-key.

**In-memory graph:** Keeps the project focused on routing algorithms and API behavior.

**Dependency injection:** Allows isolated, reproducible tests without a running server.

**Centralized validation:** Provides consistent API errors and prevents invalid state changes.

## Limitations

- Graph and traffic updates are not persisted across restarts.
- Traffic updates are manually simulated rather than collected from live providers.
- Road conditions are shared across both directions of a bidirectional road.
- Routing does not account for turn restrictions or traffic signals.
- The API is a learning and portfolio project, not a production navigation service.

## Future Improvements

- PostgreSQL or another persistent graph storage layer
- Geographical coordinates and spatial indexing
- A* routing using admissible geographical heuristics
- Traffic data ingestion
- Authentication and authorization for road updates
- Rate limiting and caching
- API deployment and monitoring

## Repository

This project is part of the [Backend Apps monorepo](https://github.com/RittickDatta/backend-apps).

Each application in the monorepo is developed and documented independently.
