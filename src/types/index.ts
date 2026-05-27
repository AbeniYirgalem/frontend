export type UserRole = "passenger" | "operator" | "admin";

export type BusAmenity =
  | "WiFi"
  | "AC"
  | "Charging"
  | "Snacks"
  | "TV"
  | "Recliner"
  | "Blanket"
  | "Water";

export type Bus = {
  id: string;
  name: string;
  company: string;
  type: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  rating: number;
  seatsAvailable: number;
  amenities: BusAmenity[];
  image: string;
};

export type Destination = {
  city: string;
  country: string;
  priceFrom: number;
  duration: string;
};

export type Company = {
  name: string;
  tagline: string;
  rating: number;
  buses: number;
};

export type Testimonial = {
  name: string;
  role: string;
  message: string;
  rating: number;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type Ticket = {
  id: string;
  passenger: string;
  route: string;
  date: string;
  seats: string[];
  price: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: "info" | "success" | "warning";
};
