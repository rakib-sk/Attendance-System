const inputName = document.getElementById("student-name");
const rollInput = document.getElementById("student-roll");
const dateInput = document.getElementById("attendance-date");
const periodInput = document.getElementById("attendance-period");
const tableBody = document.querySelector("#attendance-table tbody");

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendanceData = JSON.parse(localStorage.getItem("attendanceData")) || {};

window.onload = function() {
  if (!localStorage.getItem("students")) localStorage.setItem("students", JSON.stringify([]));
  if (!localStorage.getItem("attendanceData")) localStorage.setItem("attendanceData", JSON.stringify({}));

  students = JSON.parse(localStorage.getItem("students"));
  attendanceData = JSON.parse(localStorage.getItem("attendanceData"));

  renderTable();
};

// Add Student
function addStudent() {
  const name = inputName.value.trim();
  const rollNo = parseInt(rollInput.value.trim());

  if (!name) return alert("Please enter student name!");
  if (!rollNo) return alert("Please enter roll number!");

  if (students.some(s => s.roll === rollNo)) {
    return alert("This roll number already exists!");
  }

  students.push({ roll: rollNo, name });
  localStorage.setItem("students", JSON.stringify(students));

  inputName.value = "";
  rollInput.value = "";
  renderTable();
}

// Delete
function deleteStudent(rollNo) {
  if (confirm("Are you sure to delete this student?")) {
    students = students.filter(s => s.roll !== rollNo);
    localStorage.setItem("students", JSON.stringify(students));

    for (let date in attendanceData) {
      for (let period in attendanceData[date]) {
        if (attendanceData[date][period][rollNo] !== undefined)
          delete attendanceData[date][period][rollNo];
      }
    }

    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
    renderTable();
  }
}

// Edit Roll
function editRoll(oldRoll) {
  const newRoll = parseInt(prompt("Enter new roll number:"));
  if (!newRoll) return;

  if (students.some(s => s.roll === newRoll)) {
    return alert("This roll number already exists!");
  }

  const student = students.find(s => s.roll === oldRoll);
  student.roll = newRoll;

  for (let date in attendanceData) {
    for (let period in attendanceData[date]) {
      if (attendanceData[date][period][oldRoll] !== undefined) {
        attendanceData[date][period][newRoll] = attendanceData[date][period][oldRoll];
        delete attendanceData[date][period][oldRoll];
      }
    }
  }

  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  renderTable();
}

// Render Table
function renderTable() {
  const selectedDate = dateInput.value || new Date().toISOString().split("T")[0];
  const selectedPeriod = periodInput.value;

  tableBody.innerHTML = "";

  if (!attendanceData[selectedDate]) attendanceData[selectedDate] = {};
  if (!attendanceData[selectedDate][selectedPeriod]) attendanceData[selectedDate][selectedPeriod] = {};

  students.forEach(student => {
    const status = attendanceData[selectedDate][selectedPeriod][student.roll] || "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>
        <div class="action-buttons">
          <button class="present-btn" onclick="markPresent(${student.roll})">Present</button>
          <button class="absent-btn" onclick="markAbsent(${student.roll})">Absent</button>
        </div>
        <span class="status-label ${
          status === "Present" ? "present-label" :
          status === "Absent" ? "absent-label" : ""
        }">${status}</span>
      </td>
      <td>
        <button class="edit-roll-btn" onclick="editRoll(${student.roll})">✏️</button>
        <button class="delete-btn" onclick="deleteStudent(${student.roll})">🗑</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Attendance
function markPresent(rollNo) {
  const date = dateInput.value || new Date().toISOString().split("T")[0];
  const period = periodInput.value;

  attendanceData[date][period][rollNo] = "Present";
  saveAttendance();
  renderTable();
}

function markAbsent(rollNo) {
  const date = dateInput.value || new Date().toISOString().split("T")[0];
  const period = periodInput.value;

  attendanceData[date][period][rollNo] = "Absent";
  saveAttendance();
  renderTable();
}

function saveAttendance() {
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
}

// Change date or period reload table
dateInput.addEventListener("change", renderTable);
periodInput.addEventListener("change", renderTable);