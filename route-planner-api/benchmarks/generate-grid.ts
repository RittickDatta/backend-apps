
import { GraphRepository } from "../src/graph/graph.repository";

export interface GridFixture {
  graph: GraphRepository;
  start: string;
  destination: string;
  intersections: number;
  roads: number;
}

export function generateGrid(size: number): GridFixture {
  if (
    !Number.isInteger(size) ||
    size < 2 ||
    size > 200
  ) {
    throw new Error("Grid size must be an integer from 2 to 200");
  }

  const graph = new GraphRepository();

  const nodeId = (row: number, col: number) =>
    `N_${row}_${col}`;

  // Create every intersection first.
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      graph.addIntersection({
        id: nodeId(row, col),
        name: `Junction ${row},${col}`,
      });
    }
  }

  let roadCount = 0;

  const addRoad = (
    from: string,
    to: string,
    distanceKm: number,
    baseMinutes: number
  ) => {
    graph.addRoad({
      id: `R_${roadCount++}`,
      from,
      to,
      distanceKm,
      baseMinutes,
      oneWay: false,
    });
  };

  // Connect each intersection to its right and bottom neighbors.
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const current = nodeId(row, col);

      if (col + 1 < size) {
        addRoad(
          current,
          nodeId(row, col + 1),
          1 + ((row + col) % 5) * 0.2,
          2 + ((row * 3 + col) % 7)
        );
      }

      if (row + 1 < size) {
        addRoad(
          current,
          nodeId(row + 1, col),
          1 + ((row + col + 2) % 5) * 0.2,
          2 + ((row + col * 2) % 7)
        );
      }
    }
  }

  return {
    graph,
    start: nodeId(0, 0),
    destination: nodeId(size - 1, size - 1),
    intersections: size * size,
    roads: roadCount,
  };
}
