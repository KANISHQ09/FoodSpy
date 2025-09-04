const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let students = [
  { id: 1, name: "Aarav", age: 20 },
  { id: 2, name: "Ishita", age: 22 },
];

app.get("/students", (req, res) => {
  res.json(students);
});

app.get("/students/:id", (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  student ? res.json(student) : res.status(404).json({ message: "Student not found" });
});

app.post("/students", (req, res) => {
  const newStudent = {
    id: students.length + 1,
    name: req.body.name,
    age: req.body.age,
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/students/:id", (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (student) {
    student.name = req.body.name || student.name;
    student.age = req.body.age || student.age;
    res.json(student);
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

app.delete("/students/:id", (req, res) => {
  const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
  if (studentIndex !== -1) {
    students.splice(studentIndex, 1);
    res.json({ message: "Student deleted" });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
