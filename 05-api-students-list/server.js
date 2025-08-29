const express = require("express");
const app = express();

const students = [
  { id: 1, name: "Aarav", age: 20 },
  { id: 2, name: "Siya", age: 21 },
  { id: 3, name: "Kabir", age: 22 },
];

app.get("/students", (req, res) => res.json(students));

app.listen(3000, () => console.log("Server running on port 3000"));
