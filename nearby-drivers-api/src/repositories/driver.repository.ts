import type { Driver } from '../models/driver.model';
import { seedDrivers } from '../data/seed-drivers';

export class DriverRepository {
  private drivers = new Map<string, Driver>();

  constructor(initialDrivers: Driver[] = seedDrivers) {
    for (const driver of initialDrivers) {
      this.drivers.set(driver.id, { ...driver });
    }
  }

  findAll(): Driver[] {
    return Array.from(this.drivers.values(), (driver) => ({ ...driver }));
  }

  findById(id: string): Driver | undefined {
    const driver = this.drivers.get(id);
    return driver ? { ...driver } : undefined;
  }

  exists(id: string): boolean {
    return this.drivers.has(id);
  }

  create(driver: Driver): Driver {
    this.drivers.set(driver.id, { ...driver });
    return { ...driver };
  }

  update(id: string, changes: Partial<Driver>): Driver | undefined {
    const existing = this.drivers.get(id);

    if (!existing) return undefined;

    const updated: Driver = {
      ...existing,
      ...changes,
      id: existing.id,
    };

    this.drivers.set(id, updated);

    return { ...updated };
  }
}

export const driverRepository = new DriverRepository();
