# Backend Apps

A collection of independent backend applications built to explore **backend engineering, system design, data structures, algorithms, and real-world API development**.

This repository serves as a growing collection of hands-on projects, each focused on solving a specific engineering problem through practical implementation.

The goal is to go beyond basic CRUD applications and explore how backend systems are designed, optimized, tested, and maintained.

## 📂 Repository Structure

Each folder represents an independent backend application with its own source code, dependencies, configuration, and documentation.

```text
backend-apps/
│
├── nearby-drivers-api/
│   ├── src/
│   ├── postman/
│   ├── package.json
│   └── README.md
│
└── README.md
```

**📌 Important: Every project contains its own `README.md` with detailed setup instructions, API documentation, architecture, algorithms, testing information, and implementation details.**

This root README provides a high-level overview of all projects in the collection.

## 🚀 Projects

| Project | Description | Tech Stack | Documentation |
|---|---|---|---|
| Nearby Drivers API | Geospatial driver search using Haversine, Top-K heaps, and Set filtering | Node.js, Express, TypeScript | [README](./nearby-drivers-api/README.md) |
| Route Planner API | Weighted road graphs, BFS, Dijkstra, traffic-aware routing, and road closures | Node.js, Express, TypeScript | [README](./route-planner-api/README.md) |

More backend applications will be added as the collection grows.

---

## 🛠 Project Overviews

### 01. 🚗 Nearby Drivers API

**An Uber-inspired geospatial driver discovery system built with Node.js, Express, and TypeScript.**

This project explores how ride-hailing applications identify nearby available drivers and efficiently select the best candidates for a pickup request.

It demonstrates practical applications of data structures and algorithms within a REST API.

**Key Features**

- **Driver management:** Create, retrieve, list, and update driver information.
- **Nearest-driver search:** Identify the closest available driver using a linear scan.
- **Top-K selection:** Compare sorting-based selection with a bounded max-heap.
- **Geospatial calculations:** Calculate distances using the Haversine formula.
- **Efficient filtering:** Use Sets to exclude unavailable, blocked, or previously contacted drivers.
- **Automated testing:** Validate functionality through unit tests, integration tests, and Postman/Newman.
- **Performance benchmarking:** Compare algorithm efficiency across different dataset sizes.

**Core Concepts**

`Hash Maps` · `Sets` · `Linear Search` · `Sorting` · `Max-Heaps` · `Geospatial Algorithms` · `REST APIs`

**Tech Stack**

`Node.js` · `TypeScript` · `Express` · `Postman` · `Newman`

**Links**

- 📁 [Source Code & Detailed README](./nearby-drivers-api)
- 🌐 [Interactive Portfolio Case Study](https://www.rittickdatta.com/projects/nearby-drivers-api)

### 02. 🗺️ Route Planner API

**A Google Maps-inspired, traffic-aware route planning system built with Node.js, Express, and TypeScript.**

This project explores how navigation applications represent road networks as weighted graphs, calculate optimal routes between intersections, and dynamically adapt to changing traffic conditions and road closures.

It demonstrates practical applications of graph algorithms, priority queues, and data structures within a REST API.

**Key Features**

- **Road network management:** Create, retrieve, and manage intersections and weighted roads using adjacency lists.
- **Fewest-road routing:** Find routes with the minimum number of road segments using Breadth-First Search (BFS).
- **Shortest and fastest routes:** Use Dijkstra's algorithm with a binary min-heap to optimize routes by distance or estimated travel time.
- **Traffic-aware navigation:** Apply dynamic traffic multipliers to road travel times and automatically recalculate optimal routes.
- **Road closures and one-way streets:** Exclude closed roads and respect directional restrictions during route calculations.
- **API reliability:** Implement strict request validation, centralized error handling, and isolated graph state for testing.
- **Automated testing:** Validate graph operations, routing algorithms, traffic updates, and edge cases through unit tests, integration tests, and Postman/Newman.
- **Performance benchmarking:** Compare BFS and Dijkstra across generated road networks of increasing sizes.

**Core Concepts**

`Graphs` · `Adjacency Lists` · `BFS` · `Dijkstra's Algorithm` · `Binary Min-Heaps` · `Priority Queues` · `Dynamic Routing` · `REST APIs`

**Tech Stack**

`Node.js` · `TypeScript` · `Express` · `Postman` · `Newman`

**Links**

- 📁 [Source Code & Detailed README](https://github.com/RittickDatta/backend-apps/tree/main/route-planner-api)
- 🌐 [Interactive Portfolio Case Study](https://www.rittickdatta.com/projects/route-planner-api)

---

## 🎯 What This Repository Explores

Projects in this repository focus on different aspects of backend engineering, including:

- **API Design:** Building structured, maintainable REST APIs.
- **Data Structures & Algorithms:** Applying efficient algorithms to real-world problems.
- **System Design:** Understanding architecture, scalability, and engineering tradeoffs.
- **Performance Optimization:** Evaluating time and space complexity, benchmarking, and choosing suitable data structures.
- **Testing & Reliability:** Writing automated tests and validating application behavior.
- **Backend Best Practices:** Type safety, modular architecture, input validation, and separation of concerns.

## ⚙️ Getting Started

Each project is designed to be explored and run independently.

Clone the repository:

```bash
git clone https://github.com/RittickDatta/backend-apps.git
cd backend-apps
```

Navigate to the project you want to explore:

```bash
cd nearby-drivers-api
```

**Refer to the project's own `README.md` for installation, environment configuration, available commands, API endpoints, and testing instructions.**

Dependencies and setup requirements may vary between projects.

## 📈 Growing Collection

This repository will continue to expand with backend applications exploring different engineering challenges, architectural patterns, and algorithms.

Each new project will be added to the project index above, along with a brief overview and a link to its dedicated documentation.

---

**Each application is an independent learning and engineering project. For complete technical documentation, always refer to the `README.md` inside its respective project folder.**
