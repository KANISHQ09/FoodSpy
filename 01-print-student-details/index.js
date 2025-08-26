const student = {
  name: "Aarav Sharma",
  age: 20,
  class: "B.Tech CSE",
  marks: { math: 85, science: 90, english: 78 },
};

console.log("---- Student Details ----");
for (const key in student) {
  if (typeof student[key] === "object") {
    console.log(`${key}:`);
    for (const subject in student[key]) {
      console.log(`   ${subject}: ${student[key][subject]}`);
    }
  } else {
    console.log(`${key}: ${student[key]}`);
  }
}
