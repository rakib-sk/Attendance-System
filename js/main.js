const inputName = document.getElementById("student-name");
const rollInput = document.getElementById("student-roll");
const dateInput = document.getElementById("attendance-date");
const tableBody = document.querySelector("#attendance-table tbody");

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendanceData = JSON.parse(localStorage.getItem("attendanceData")) || {};




window.onload = function() {
  if (!localStorage.getItem("students")) localStorage.setItem("students", JSON.stringify([]));
  if (!localStorage.getItem("attendanceData")) localStorage.setItem("attendanceData", JSON.stringify({}));

  students = JSON.parse(localStorage.getItem("students"));
  attendanceData = JSON.parse(localStorage.getItem("attendanceData"));

  renderTable();
}




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





function deleteStudent(rollNo) {
  if (confirm("Are you sure to delete this student?")) {
    students = students.filter(s => s.roll !== rollNo);
    localStorage.setItem("students", JSON.stringify(students));

    for (let date in attendanceData) {
      if (attendanceData[date][rollNo] !== undefined) delete attendanceData[date][rollNo];
    }
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
    renderTable();
  }
}




function editRoll(oldRoll) {
  const newRoll = parseInt(prompt("Enter new roll number:"));
  if (!newRoll) return;

  if (students.some(s => s.roll === newRoll)) {
    return alert("This roll number already exists!");
  }

  const student = students.find(s => s.roll === oldRoll);
  student.roll = newRoll;

  for (let date in attendanceData) {
    if (attendanceData[date][oldRoll] !== undefined) {
      attendanceData[date][newRoll] = attendanceData[date][oldRoll];
      delete attendanceData[date][oldRoll];
    }
  }

  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  renderTable();
}



function renderTable() {
  const selectedDate = dateInput.value || new Date().toISOString().split("T")[0];
  tableBody.innerHTML = "";

  if (!attendanceData[selectedDate]) attendanceData[selectedDate] = {};

  students.forEach(student => {
    const status = attendanceData[selectedDate][student.roll] || "";
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

// Change Date
dateInput.addEventListener("change", renderTable);

// Attendance Functions
function markPresent(rollNo) {
  const selectedDate = dateInput.value || new Date().toISOString().split("T")[0];
  attendanceData[selectedDate][rollNo] = "Present";
  saveAttendance();
  renderTable();
}

function markAbsent(rollNo) {
  const selectedDate = dateInput.value || new Date().toISOString().split("T")[0];
  attendanceData[selectedDate][rollNo] = "Absent";
  saveAttendance();
  renderTable();
}

function saveAttendance() {
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
}