import React from "react";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$99",
    description: "High-quality sound with noise cancellation.",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$149",
    description: "Track your fitness and stay connected.",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: "$59",
    description: "Ergonomic design with customizable buttons.",
    image: "https://via.placeholder.com/150",
  },
];

function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded mb-3"
      />
      <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-blue-600 font-bold">{product.price}</span>
        <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600">
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default function ProductCardList() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
