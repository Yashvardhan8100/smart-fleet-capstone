export enum Role {
  ADMIN = 'ADMIN',
  FLEET_MANAGER = 'FLEET_MANAGER',
  DRIVER = 'DRIVER',
  MECHANIC = 'MECHANIC'
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  email: string;
  contactNumber?: number;
  role: string;
}