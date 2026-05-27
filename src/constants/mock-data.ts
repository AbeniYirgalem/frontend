import type {
  Bus,
  Company,
  Destination,
  FAQ,
  Notification,
  Testimonial,
  Ticket,
} from "@/types";

export const destinations: Destination[] = [
  { city: "Lagos", country: "Nigeria", priceFrom: 32, duration: "5h 20m" },
  { city: "Accra", country: "Ghana", priceFrom: 28, duration: "4h 40m" },
  { city: "Nairobi", country: "Kenya", priceFrom: 36, duration: "6h 05m" },
  {
    city: "Cape Town",
    country: "South Africa",
    priceFrom: 44,
    duration: "7h 15m",
  },
];

export const busCompanies: Company[] = [
  {
    name: "SwiftRide Express",
    tagline: "Premium intercity coaches",
    rating: 4.8,
    buses: 120,
  },
  {
    name: "MetroLink",
    tagline: "Smart city connections",
    rating: 4.6,
    buses: 88,
  },
  {
    name: "Skyline Travels",
    tagline: "Night routes, quiet cabins",
    rating: 4.7,
    buses: 64,
  },
  {
    name: "Pulse Transit",
    tagline: "High-frequency departures",
    rating: 4.5,
    buses: 92,
  },
];

export const buses: Bus[] = [
  {
    id: "bus_001",
    name: "Ocean Deluxe",
    company: "SwiftRide Express",
    type: "Luxury Coach",
    departureCity: "Lagos",
    destinationCity: "Abuja",
    departureTime: "06:30",
    arrivalTime: "12:45",
    duration: "6h 15m",
    price: 42,
    rating: 4.9,
    seatsAvailable: 12,
    amenities: ["WiFi", "AC", "Charging", "Snacks", "TV"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bus_002",
    name: "Urban Cruiser",
    company: "MetroLink",
    type: "Sleeper",
    departureCity: "Accra",
    destinationCity: "Kumasi",
    departureTime: "09:15",
    arrivalTime: "13:30",
    duration: "4h 15m",
    price: 30,
    rating: 4.6,
    seatsAvailable: 22,
    amenities: ["WiFi", "AC", "Charging", "Water"],
    image:
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bus_003",
    name: "Aurora Nightliner",
    company: "Skyline Travels",
    type: "Executive",
    departureCity: "Nairobi",
    destinationCity: "Mombasa",
    departureTime: "21:00",
    arrivalTime: "04:00",
    duration: "7h 00m",
    price: 48,
    rating: 4.8,
    seatsAvailable: 8,
    amenities: ["WiFi", "AC", "Recliner", "Blanket"],
    image:
      "https://images.unsplash.com/photo-1472417583565-62e7bdeda490?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bus_004",
    name: "Pulse Runner",
    company: "Pulse Transit",
    type: "Standard",
    departureCity: "Cape Town",
    destinationCity: "Johannesburg",
    departureTime: "07:45",
    arrivalTime: "15:00",
    duration: "7h 15m",
    price: 40,
    rating: 4.5,
    seatsAvailable: 18,
    amenities: ["WiFi", "AC", "Charging"],
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Fatima D.",
    role: "Frequent traveler",
    message:
      "The booking flow feels like a premium airline app. Seats updated instantly.",
    rating: 5,
  },
  {
    name: "Jacob M.",
    role: "Operations lead",
    message:
      "Our operators dashboard is finally unified with route analytics and seat tracking.",
    rating: 5,
  },
  {
    name: "Sonia P.",
    role: "Business commuter",
    message: "Live tracking and quick rebooking saved me during a delay.",
    rating: 4,
  },
];

export const faqs: FAQ[] = [
  {
    question: "Can I cancel or reschedule my ticket?",
    answer:
      "Yes, manage changes from your dashboard up to 2 hours before departure.",
  },
  {
    question: "How do I track my bus in real time?",
    answer:
      "Open your ticket and enable Live Tracking to view the bus location.",
  },
  {
    question: "Do you support loyalty points?",
    answer:
      "Every booking earns points that unlock discounts and priority boarding.",
  },
];

export const sampleTickets: Ticket[] = [
  {
    id: "TKT-3821",
    passenger: "Dayo Okon",
    route: "Lagos -> Abuja",
    date: "May 14, 2026",
    seats: ["A1", "A2"],
    price: 84,
    status: "Confirmed",
  },
  {
    id: "TKT-4102",
    passenger: "Leila Mensah",
    route: "Accra -> Kumasi",
    date: "May 21, 2026",
    seats: ["C4"],
    price: 30,
    status: "Pending",
  },
];

export const notifications: Notification[] = [
  {
    id: "N1",
    title: "New booking",
    message: "3 seats booked on Ocean Deluxe for May 18.",
    createdAt: "2m ago",
    type: "success",
  },
  {
    id: "N2",
    title: "Route approval",
    message: "Your new night route is pending admin approval.",
    createdAt: "1h ago",
    type: "info",
  },
];
