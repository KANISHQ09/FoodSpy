import React from "react";

const people = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Frontend Developer",
    location: "Bengaluru, IN",
    email: "aarav.sharma@example.com",
    bio: "React enthusiast focused on clean UI and accessible components.",
  },
  {
    id: 2,
    name: "Ishita Verma",
    role: "UI/UX Designer",
    location: "Pune, IN",
    email: "ishita.verma@example.com",
    bio: "Designs practical interfaces with attention to micro-interactions.",
  },
];

function ProfileCard({ person }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition">
      <h2 className="text-lg font-semibold mb-1">{person.name}</h2>
      <p className="text-sm text-gray-600 mb-1">{person.role}</p>
      <p className="text-xs text-gray-500 mb-2">{person.location}</p>
      <p className="text-sm text-gray-700 mb-3">{person.bio}</p>
      <a
        href={`mailto:${person.email}`}
        className="text-blue-600 text-sm hover:underline"
      >
        Email
      </a>
    </div>
  );
}

export default function ProfileCardsPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-gray-50 min-h-screen">
      {people.map((p) => (
        <ProfileCard key={p.id} person={p} />
      ))}
    </div>
  );
}
