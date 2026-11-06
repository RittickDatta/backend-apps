
export interface Driver {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available: boolean;
  updatedAt: string;
}

export interface CreateDriverInput {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available?: boolean;
}

export interface UpdateDriverInput {
  latitude?: number;
  longitude?: number;
  available?: boolean;
}
