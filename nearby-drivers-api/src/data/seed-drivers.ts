import type { Driver } from '../models/driver.model';

export const seedDrivers: Driver[] = [
  {
    id: "D1",
    name: "Rahul",
    latitude: 26.1445,
    longitude: 91.7362,
    available: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "D2",
    name: "Priya",
    latitude: 26.1500,
    longitude: 91.7400,
    available: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "D3",
    name: "Aman",
    latitude: 26.1380,
    longitude: 91.7300,
    available: false,
    updatedAt: new Date().toISOString(),
  },
];
