export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export const LOCAL_USERS: User[] = [
  {
    id: "u1",
    name: "Richmond",
    email: "rich@example.com",
    password: "password",
  },
];

export const MEDICINES = [
  { id: "paracetamol", name: "Paracetamol 500mg (10 tabs)", price: 12.0 },
  { id: "ibuprofen", name: "Ibuprofen 200mg (10 tabs)", price: 15.0 },
  { id: "ors", name: "Oral Rehydration Salts", price: 8.5 },
  { id: "amoxicillin", name: "Amoxicillin 500mg (Caps, 15s)", price: 35.0 },
];

export const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Afua Mensah",
    speciality: "General Practitioner",
    rating: 4.8,
    city: "Accra",
  },
  {
    id: "d2",
    name: "Dr. Kwesi Owusu",
    speciality: "Pediatrics",
    rating: 4.6,
    city: "Tema",
  },
  {
    id: "d3",
    name: "Dr. Akosua Sarpong",
    speciality: "Internal Medicine",
    rating: 4.7,
    city: "Accra",
  },
];
