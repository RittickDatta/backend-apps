
import { GraphRepository } from "../graph/graph.repository";

export function createSeededGraph(): GraphRepository {
  const graph = new GraphRepository();

  const intersections = [
    { id: "A", name: "City Center" },
    { id: "B", name: "Market Junction" },
    { id: "C", name: "Railway Station" },
    { id: "D", name: "Hospital Crossing" },
    { id: "E", name: "University Road" },
  ];

  for (const intersection of intersections) {
    graph.addIntersection(intersection);
  }

  const roads = [
    {
      id: "R1", from: "A", to: "B",
      distanceKm: 2, baseMinutes: 4, oneWay: false,
    },
    {
      id: "R2", from: "B", to: "C",
      distanceKm: 3, baseMinutes: 6, oneWay: false,
    },
    {
      id: "R3", from: "A", to: "D",
      distanceKm: 4, baseMinutes: 5, oneWay: false,
    },
    {
      id: "R4", from: "B", to: "E",
      distanceKm: 1, baseMinutes: 3, oneWay: false,
    },
    {
      id: "R5", from: "D", to: "E",
      distanceKm: 2, baseMinutes: 4, oneWay: false,
    },
    {
      id: "R6", from: "E", to: "C",
      distanceKm: 5, baseMinutes: 7, oneWay: false,
    },
  ];

  for (const road of roads) {
    graph.addRoad(road);
  }

  return graph;
}
