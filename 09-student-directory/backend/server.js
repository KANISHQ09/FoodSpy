const express = require("express");
const app = express();
app.use(express.json());

let students = [{ id: 1, name: "Aarav" }, { id: 2, name: "Siya" }];

app.get("/students", (req, res) => res.json(students));

app.listen(3000, () => console.log("Backend running on 3000"));
