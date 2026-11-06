# Top-K nearest drivers benchmark

## Results

Run with `npm run benchmark`. Results below were captured on 2026-11-06. Times are milliseconds; each is the median of 15 measured runs after 5 warmups. The ratio is `sortMs / heapMs`, so values above `1` mean the heap was faster.

| Drivers | k | Sort (ms) | Heap (ms) | Sort / heap |
|---:|---:|---:|---:|---:|
| 100 | 5 | 0.019 | 0.053 | 0.36x |
| 100 | 50 | 0.023 | 0.024 | 0.99x |
| 1,000 | 5 | 0.280 | 0.112 | 2.49x |
| 1,000 | 50 | 0.233 | 0.137 | 1.70x |
| 10,000 | 5 | 3.081 | 0.956 | 3.22x |
| 10,000 | 50 | 2.864 | 0.847 | 3.38x |
| 100,000 | 5 | 40.651 | 8.562 | 4.75x |
| 100,000 | 50 | 43.829 | 8.878 | 4.94x |

### Relative timing

Each `#` represents approximately 0.25x in the sort-to-heap ratio. A larger bar means the heap has a greater speed advantage; ratios below 1x mean sorting was faster.

```text
Drivers   k    Sort / heap
    100   5    0.36x  #
    100  50    0.99x  ####
  1,000   5    2.49x  ##########
  1,000  50    1.70x  #######
 10,000   5    3.22x  #############
 10,000  50    3.38x  ##############
100,000   5    4.75x  ###################
100,000  50    4.94x  ####################
```

## Interpretation

The heap is effectively tied with sorting at 100 drivers, and sorting is faster for `k = 5` at that size. As the input grows, the heap consistently wins: it is about 1.7–2.5x faster at 1,000 drivers and about 3.2–4.9x faster at 10,000–100,000 drivers. For the largest input, it takes about 8.6–8.9 ms versus 40.7–43.8 ms for sorting.

This supports using the bounded-heap strategy when selecting a small top-K result from a large driver collection. For small inputs, the heap's overhead can erase its advantage, so the benchmark does not establish that it is faster in every case. Both strategies produced identical ranked results for every tested input and limit.

## Method and caveats

The script uses deterministic generated driver data, tests input sizes of 100, 1,000, 10,000, and 100,000 with `k` values of 5 and 50, and excludes two blocked IDs and one contacted ID. It warms each operation 5 times, then takes the median of 15 timed calls. Strategy execution order is alternated for some cases. Dataset generation and the result-equivalence check are outside the timed calls.

These are local algorithm timings, not end-to-end API latency or a cross-machine comparison. Runtime, hardware, and workload differences can change the measurements; rerun the benchmark in the target environment before making deployment decisions.
