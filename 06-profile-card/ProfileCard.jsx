export default function ProfileCard({ name, age, bio }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>{bio}</p>
    </div>
  );
}
