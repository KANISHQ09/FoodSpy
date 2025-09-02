export default function ProductList() {
  const products = [
    { id: 1, name: "Laptop", price: 60000 },
    { id: 2, name: "Phone", price: 30000 },
  ];

  return (
    <div style={{ display: "flex", gap: "15px" }}>
      {products.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>{p.name}</h3>
          <p>₹{p.price}</p>
        </div>
      ))}
    </div>
  );
}
