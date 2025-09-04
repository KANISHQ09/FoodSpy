const express = require("express");
const app = express();
app.use(express.json());

let students = [];

app.get("/students", (req, res) => res.json(students));
app.post("/students", (req, res) => {
  const student = { id: Date.now(), ...req.body };
  students.push(student);
  res.json(student);
});
app.put("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  students = students.map((s) => (s.id === id ? { ...s, ...req.body } : s));
  res.json({ success: true });
});
app.delete("/students/:id", (req, res) => {
  students = students.filter((s) => s.id !== parseInt(req.params.id));
  res.json({ success: true });
});

app.listen(3000, () => console.log("CRUD API running on 3000"));
