export type BackendBus = {
  _id: string;
  operatorId: string;
  name: string;
  type: string;
  totalSeats: number;
  amenities: string[];
  images: string[];
};

export type BackendRoute = {
  _id: string;
  from: string;
  to: string;
  distance: number;
};

export type BackendSchedule = {
  _id: string;
  busId?: BackendBus;
  routeId?: BackendRoute;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
};
