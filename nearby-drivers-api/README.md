# 🚗 Nearby Drivers API

**A geospatial driver discovery API built with Node.js, Express, and TypeScript, demonstrating real-world Data Structures & Algorithms.**

Inspired by ride-hailing platforms such as Uber, this project explores how to find the nearest available driver, rank the Top-K nearby drivers, and efficiently filter ineligible drivers.

The focus is not just on building REST endpoints, but on understanding the **algorithmic decisions, performance tradeoffs, and testing practices** behind a backend service.

## ✨ Features

- **Driver management:** Create, list, retrieve, and update drivers.
- **Nearest-driver search:** Find the closest available driver using a linear scan.
- **Top-K driver selection:** Compare full sorting with a bounded max-heap.
- **Geospatial distance:** Calculate distances using the Haversine formula.
- **Eligibility filtering:** Exclude unavailable, blocked, or previously contacted drivers using Sets.
- **Search radius:** Restrict results to drivers within a specified distance.
- **Deterministic ranking:** Break equal-distance ties using driver IDs.
- **Input validation:** Handle invalid coordinates, limits, and request payloads.
- **Automated testing:** Unit, integration, randomized algorithm, and API tests.
- **Benchmarking:** Compare sorting and heap selection across generated datasets.
- **Interactive portfolio demo:** Explore the algorithms through a separate Next.js case study.

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Type safety |
| Express | REST API framework |
| Map | In-memory driver storage |
| Set | Efficient eligibility filtering |
| Max-heap | Top-K candidate selection |
| Haversine formula | Geographic distance calculation |
| Node.js Test Runner | Automated testing |
| Postman | API request collection |
| Newman | Command-line API testing |
| tsx | TypeScript development and script execution |

## 🧠 Problem Statement

Imagine a passenger requesting a ride.

The platform must answer several questions:

1. Which drivers are currently available?
2. Which driver is closest to the pickup location?
3. What are the five closest eligible drivers?
4. How do we exclude drivers who have already declined or been contacted?
5. Can we find the Top-K drivers without sorting every candidate?

This project implements those operations using progressively more efficient data structures and algorithms.

## 🏗 Architecture

The application separates HTTP handling, business logic, algorithms, and data storage.

```text
Client / Postman
       |
       v
  Express Routes
       |
       v
     Services
       |
       +---------------------+
       |                     |
       v                     v
   Algorithms          Driver Repository
       |                     |
       v                     v
 Haversine / Scan        Map<string, Driver>
 Sorting / Max-heap
```

### Architecture Layers

| Layer | Responsibility |
|---|---|
| Routes | Receive HTTP requests and return JSON responses |
| Services | Validate inputs and coordinate application logic |
| Algorithms | Calculate distances and select nearest drivers |
| Repository | Store and retrieve driver records |

The application uses **dependency injection** to allow tests to create isolated repositories and Express instances.

This prevents shared in-memory state from leaking between integration tests.

## 📁 Project Structure

```text
nearby-drivers-api/
├── src/
│   ├── algorithms/
│   │   ├── haversine.ts
│   │   ├── nearest-driver.ts
│   │   ├── max-heap.ts
│   │   └── top-k-drivers.ts
│   ├── benchmarks/
│   │   └── top-k.benchmark.ts
│   ├── config/
│   │   └── env.ts
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── app.ts
│   └── server.ts
├── postman/
│   ├── Nearby_Drivers_API_FIXED.postman_collection.json
│   └── Nearby_Drivers_Local.postman_environment.json
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

*The directory layout illustrates the intended separation of concerns. Refer to the repository for the exact filenames.*

## ⚙️ Getting Started

### Prerequisites

- Node.js 20.19 or later
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nearby-drivers-api.git
cd nearby-drivers-api
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=4000
NODE_ENV=development
```

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:4000
```

### 5. Verify the health endpoint

```bash
curl http://localhost:4000/health
```

Example response:

```json
{
  "status": "ok",
  "service": "nearby-drivers-api",
  "timestamp": "2026-11-06T12:00:00.000Z"
}
```

The timestamp is generated at runtime.

## 📡 API Reference

### Driver Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| POST | `/api/drivers` | Create a driver |
| GET | `/api/drivers` | List all drivers |
| GET | `/api/drivers/:id` | Retrieve a driver |
| PATCH | `/api/drivers/:id` | Update driver details |

### Create a Driver

**POST** `/api/drivers`

```json
{
  "id": "D100",
  "name": "Rahul",
  "latitude": 26.1445,
  "longitude": 91.7362,
  "available": true
}
```

Example successful response:

```json
{
  "driver": {
    "id": "D100",
    "name": "Rahul",
    "latitude": 26.1445,
    "longitude": 91.7362,
    "available": true,
    "updatedAt": "2026-11-06T12:00:00.000Z"
  }
}
```

**Status:** `201 Created`

### Find the Nearest Driver

**GET** `/api/drivers/nearest`

Query parameters:

| Parameter | Required | Description |
|---|---|---|
| `lat` | Yes | Pickup latitude |
| `lng` | Yes | Pickup longitude |
| `radiusKm` | No | Maximum search radius |

Example:

```bash
curl "http://localhost:4000/api/drivers/nearest?lat=26.1445&lng=91.7362&radiusKm=5"
```

Example response:

```json
{
  "driver": {
    "id": "D1",
    "name": "Rahul",
    "latitude": 26.1445,
    "longitude": 91.7362,
    "available": true,
    "updatedAt": "2026-11-06T12:00:00.000Z"
  },
  "distanceKm": 0
}
```

When no eligible driver is found:

```json
{
  "driver": null,
  "message": "No available drivers found"
}
```

### Find Top-K Nearby Drivers

**GET** `/api/drivers/nearby`

Query parameters:

| Parameter | Required | Default | Description |
|---|---|---|---|
| `lat` | Yes | — | Pickup latitude |
| `lng` | Yes | — | Pickup longitude |
| `limit` | No | `5` | Maximum results, from 1 to 100 |
| `strategy` | No | `heap` | `sort` or `heap` |
| `radiusKm` | No | — | Maximum search radius |
| `blockedIds` | No | — | Comma-separated driver IDs |
| `contactedIds` | No | — | Comma-separated driver IDs |

**Sorting strategy:**

```bash
curl "http://localhost:4000/api/drivers/nearby?lat=26.1445&lng=91.7362&limit=3&strategy=sort"
```

**Heap strategy:**

```bash
curl "http://localhost:4000/api/drivers/nearby?lat=26.1445&lng=91.7362&limit=3&strategy=heap"
```

**Exclude blocked and contacted drivers:**

```bash
curl "http://localhost:4000/api/drivers/nearby?lat=26.1445&lng=91.7362&limit=3&strategy=heap&blockedIds=D1&contactedIds=D2"
```

Example response structure:

```json
{
  "count": 1,
  "strategy": "heap",
  "drivers": [
    {
      "id": "D4",
      "name": "Sneha",
      "latitude": 26.147,
      "longitude": 91.735,
      "available": true,
      "updatedAt": "2026-11-06T12:00:00.000Z",
      "distanceKm": 0.303
    }
  ]
}
```

The exact results depend on the current repository data.

## 🧮 Algorithms and Data Structures

### 1. Nearest Driver — Linear Scan

The nearest-driver algorithm iterates through the available drivers, calculates each driver's distance from the pickup point, and keeps the closest candidate.

```text
nearest = null

for each driver:
    if driver is unavailable:
        continue

    distance = haversine(pickup, driver)

    if distance is smaller than best distance:
        nearest = driver

return nearest
```

**Complexity**

- Time: `O(n)`
- Extra space: `O(1)` for the core scan

This approach is simple and effective when the candidate dataset is manageable.

### 2. Top-K Selection — Sorting

The sorting strategy calculates distances for eligible drivers, sorts them in ascending order, and returns the first K.

```text
eligible = filter available drivers
ranked = calculate distances
sort ranked by distance
return first K
```

**Complexity**

- Time: `O(n log n)` in the worst case
- Extra space: `O(n)` for candidate storage

**Best for:** Simplicity, debugging, and use cases where a full ranking is useful.

### 3. Top-K Selection — Bounded Max-Heap

The heap strategy retains only the K best candidates encountered so far.

The heap root represents the **worst retained candidate**.

For each eligible driver:

1. Add the driver if the heap contains fewer than K candidates.
2. Otherwise, compare the driver with the heap root.
3. Replace the root if the new driver ranks better.
4. Sort the final K results before returning them.

**Complexity**

- Time: `O(n log k + k log k)`
- Heap storage: `O(k)`

**Best for:** Selecting a small number of nearest drivers from a large candidate stream.

### 4. Eligibility Filtering — Set

The API uses Sets to efficiently exclude blocked and previously contacted drivers.

```typescript
const blockedIds = new Set(["D1", "D3"]);
const contactedIds = new Set(["D5"]);

const eligible = drivers.filter(
  (driver) =>
    driver.available &&
    !blockedIds.has(driver.id) &&
    !contactedIds.has(driver.id)
);
```

Set membership checks take **O(1) average time**, avoiding repeated linear searches through exclusion arrays.

### 5. Driver Storage — Map

An in-memory `Map<string, Driver>` supports efficient ID-based access.

```typescript
const drivers = new Map<string, Driver>();

drivers.set("D1", driver);
const found = drivers.get("D1");
```

Map lookup, insertion, and deletion have **O(1) average time complexity**.

## 📊 Complexity Comparison

| Operation | Time Complexity | Core Extra Space |
|---|---|---|
| Driver lookup by ID | O(1) average | O(1) |
| Nearest-driver linear scan | O(n) | O(1) |
| Top-K using sorting | O(n log n) | O(n) |
| Top-K using max-heap | O(n log k + k log k) | O(k) |
| Set membership check | O(1) average | O(1) per lookup |

**Important:** These figures describe the core algorithms. The current API's `findAll()` repository method creates an array of all drivers, so an entire request can still allocate O(n) memory even when heap selection itself retains only O(k) candidates.

## 🧪 Testing

The project includes multiple levels of testing.

### Unit Tests

Verify individual algorithms and utility functions:

- Haversine distance calculations
- Nearest-driver selection
- Sorting-based Top-K selection
- Heap-based Top-K selection
- Deterministic tie-breaking

### Integration Tests

Verify API behavior with isolated Express applications and repositories:

- Driver creation and updates
- Duplicate driver IDs
- Invalid coordinates and request payloads
- Missing drivers
- Available-driver filtering
- Search-radius restrictions
- Blocked and contacted driver exclusions

### Randomized Algorithm Tests

Generate reproducible driver datasets and compare sorting against heap selection.

Both strategies should return the same ordered driver IDs for identical inputs.

### Run Tests

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

## 📮 Postman and Newman

The repository includes a Postman collection and a local environment for repeatable API checks.

The collection covers happy paths and error scenarios, including driver creation, nearest-driver search, Top-K selection, exclusions, and invalid requests.

### Run the Postman Collection

Start the API:

```bash
npm run dev
```

Then, in another terminal:

```bash
npx newman run \
  postman/Nearby_Drivers_API_FIXED.postman_collection.json \
  -e postman/Nearby_Drivers_Local.postman_environment.json
```

**Note:** The collection creates a test driver with a fixed ID. Because the backend uses in-memory storage, restart the API before rerunning the complete collection, or update the test driver ID to avoid duplicate-ID conflicts.

## ⚡ Benchmarking

A benchmark script compares sorting and heap selection using generated driver datasets.

```bash
npm run benchmark
```

The benchmark covers different dataset sizes and K values, with warmup runs and repeated measurements.

Example comparison dimensions:

| Driver Count | K |
|---|---|
| 100 | 5, 50 |
| 1,000 | 5, 50 |
| 10,000 | 5, 50 |
| 100,000 | 5, 50 |

Actual performance depends on the Node.js version, hardware, dataset, and selected K.

**No benchmark speedup is claimed without measured results.**

## 🎨 Interactive Portfolio Case Study

A separate Next.js portfolio page demonstrates the algorithm through an interactive browser simulation.

Visitors can:

- Switch between sorting and max-heap selection.
- Change the number of requested drivers.
- Adjust the search radius.
- Exclude individual drivers.
- See selected drivers and calculated distances.
- Read the architecture and complexity analysis.

**Portfolio:** [Nearby Drivers API Case Study](https://www.rittickdatta.com/projects/nearby-drivers-api)

The visualization uses a simulated dataset and does not require a deployed Express backend.

## ⚠️ Limitations

This project is an educational backend engineering implementation, not a production-ready ride-hailing dispatch system.

- **In-memory storage:** Driver data is lost when the server restarts.
- **Linear candidate discovery:** Finding eligible drivers still requires scanning the dataset.
- **Straight-line distance:** Haversine distance does not represent road distance or actual pickup time.
- **No live traffic:** Routing conditions, congestion, and road closures are not considered.
- **No persistent database:** The repository is designed for algorithm demonstrations and isolated testing.
- **No production dispatch workflow:** Driver acceptance, retries, authentication, and concurrent assignment are outside the current scope.

## 🔮 Future Improvements

- Add PostgreSQL with PostGIS for persistent geospatial storage.
- Explore geohashing, quadtrees, or R-trees for spatial indexing.
- Integrate road-network routing and traffic-aware ETAs.
- Introduce Redis for frequently accessed driver-location data.
- Support real-time driver-location updates.
- Add authentication, rate limiting, and observability.
- Benchmark indexed searches against full scans.

## 🎯 Key Learnings

Building this project reinforced several important backend engineering principles:

1. **Start with a correct baseline.** A linear scan and full sort provide simple reference implementations.
2. **Choose data structures based on access patterns.** Maps help with ID lookup, Sets with membership checks, and heaps with bounded ranking.
3. **Distinguish algorithmic complexity from system complexity.** An O(k)-space selection algorithm can still be part of an O(n)-memory API request.
4. **Make correctness testable.** Isolated repositories and cross-strategy comparisons help catch subtle bugs.
5. **Measure rather than assume.** Benchmarks are useful for evaluating real-world performance tradeoffs.
6. **Explain engineering decisions.** A good project demonstrates why an approach was chosen, not merely that it works.

---

**Built as a hands-on Data Structures & Algorithms project using TypeScript and Express.**