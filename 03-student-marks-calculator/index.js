let math = 85;
let science = 90;
let english = 78;

let total = math + science + english;

let average = total / 3;

let grade;
if (average >= 90) grade = "A+";
else if (average >= 80) grade = "A";
else if (average >= 70) grade = "B";
else if (average >= 60) grade = "C";
else grade = "Fail";

console.log("Total Marks:", total);
console.log("Average Marks:", average);
console.log("Grade:", grade);
