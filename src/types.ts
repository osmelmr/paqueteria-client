export interface User {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    role: string;
    isActive: boolean;
}

export interface Agency {
    id: string;
    name: string;
}

export interface Guide {
    id: string;
    externalRef: string;
    agencyId?: string;
    agency?: Agency | null;
    createdAt?: string;
}

export interface Location {
    id: string;
    name: string;
}

export interface Province {
    id: string;
    name: string;
}

export interface Recipient {
    id: string;
    fullName: string;
    idCard: string;
    phone?: string;
}

export interface Status {
    id: string;
    name: string;
}

export interface PackageHbl {
    id: string;
    hblCode: string;
}

export interface Vehicle {
  id: string;
  name: string;
  isActive: boolean;
  drivers?: DriverVehicle[];
  _count?: { routes: number };
}

export interface Driver {
  id: string;
  name: string;
  isActive: boolean;
  vehicles?: DriverVehicle[];
}

export interface DriverVehicle {
  id: string;
  vehicleId: string;
  driverId: string;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface RouteItem {
  id: string;
  name: string;
  description?: string | null;
  departureDate?: string;
  vehicle?: Vehicle | null;
  packages?: PackageItem[];
}

export interface PackageItem {
    id: string;
    guide?: Guide | null;
    recipient?: Recipient | null;
    province?: Province | null;
    status?: Status | null;
    location?: Location | null;
    addressDetail?: string | null;
    weight?: number | null;
    contentDescription?: string | null;
    arrivalDate?: string | null;
    anotations?: string | null;
    alert?: boolean | null;
    alertDescription?: string | null;
    hbls?: PackageHbl[] | null;
    createdAt?: string;
}
