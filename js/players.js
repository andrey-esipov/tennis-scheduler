export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const slots = [
  "6-8 AM", "8-10 AM", "10-12 PM", "12-2 PM", "2-4 PM", "4-6 PM", "6-8 PM", "8-10 PM"
];

export const defaultPlayers = [
  {
    id: "andrey",
    name: "Andrey",
    location: "Franklin, TN",
    avatar: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=200&q=80",
    skill: 7,
    preferences: { indoor: true, outdoor: true, clay: false, hard: true },
    availability: {}
  },
  {
    id: "alex",
    name: "Alex",
    location: "Murfreesboro, TN",
    avatar: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=200&q=80",
    skill: 6,
    preferences: { indoor: true, outdoor: true, clay: true, hard: true },
    availability: {}
  }
];
