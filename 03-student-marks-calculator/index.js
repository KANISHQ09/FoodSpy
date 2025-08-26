const marks = [85, 90, 78, 88, 92];

const total = marks.reduce((a, b) => a + b, 0);
const avg = total / marks.length;
let grade = avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B" : "C";

console.log(`Total: ${total}, Average: ${avg}, Grade: ${grade}`);
