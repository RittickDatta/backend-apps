# Routing Algorithm Benchmarks

## Objective

Compare the execution time of BFS and heap-based Dijkstra on generated, weighted road networks.

BFS minimizes the number of road segments. Dijkstra minimizes either distance or estimated travel time. These benchmarks compare execution cost, not route quality across different objectives.

## Environment

- **Runtime:** Node.js 24
- **Machine:** i7 CPU & 16Gb RAM
- **Operating system:** Windows
- **Benchmark command:** `npm run bench`
- **Date:** 13th Nov, 2026

## Methodology

The benchmark generates deterministic square grid graphs.

Each intersection connects to adjacent intersections through weighted, bidirectional roads.

For each graph size:

1. Generate the graph outside the timed section.
2. Warm up each algorithm with 20 calls.
3. Execute 50 timed calls.
4. Report median execution time in milliseconds.
5. Verify each algorithm finds a route.

The benchmark measures in-process routing only, excluding HTTP, serialization, and graph construction.

## Results

| Grid | Intersections | Roads | BFS median (ms) | Dijkstra distance (ms) | Dijkstra time (ms) |
|---|---:|---:|---:|---:|---:|
| 10×10 | 100 | 180 | '0.043' | '0.068' | '0.060' |
| 25×25 | 625 | 1,200 | '0.271' | '0.413' | '0.367' |
| 50×50 | 2,500 | 4,900 | '0.924' | '1.830' | '1.888' |
| 75×75 | 5,625 | 11,100 | '2.907' | '5.122' | '5.369' |
| 100×100 | 10,000 | 19,800 | '6.334' | '10.257' | '10.330' |

## Complexity

| Algorithm | Time | Auxiliary space |
|---|---|---|
| BFS | O(V + E) | O(V) |
| Dijkstra with lazy-deletion heap | O((V + E) log(V + E)) | O(V + E) |

## Interpretation

[Describe the observed trends after running the benchmark.]

Explain whether Dijkstra takes longer than BFS for your measurements, how the gap changes with graph size, and whether distance-optimized and time-optimized Dijkstra have similar runtimes.

Do not claim that one algorithm is universally faster based on a single run.

## Limitations

- Grid graphs are simpler than real road networks.
- Benchmarks use deterministic edge weights and a single origin–destination pair per graph.
- JavaScript JIT compilation, garbage collection, and CPU scheduling affect measurements.
- The benchmark measures one process, not concurrent API requests.
- No database, external traffic provider, or network latency is included.
- The routing implementation uses lazy heap deletion rather than decrease-key.

## Future improvements

- Benchmark random source–destination pairs.
- Run repeated benchmark processes.
- Report p50, p95, and p99 latencies.
- Measure heap allocation and memory usage.
- Benchmark API throughput and concurrent requests.
- Compare Dijkstra with A* for geographically informed routing.
