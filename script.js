// Initialize local storage
const storage = {
    students: JSON.parse(localStorage.getItem('students') || '[]'),
    subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
    attendance: JSON.parse(localStorage.getItem('attendance') || '{}'),
    timetable: JSON.parse(localStorage.getItem('timetable') || '[]')
};

// Update date display
document.getElementById('date').textContent = new Date().toLocaleDateString();

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'attendance') loadAttendanceView();
    if (sectionId === 'timetable') loadTimetable();
}

// Student management
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const rollNo = document.getElementById('rollNo').value;
    storage.students.push({ id: Date.now(), name, rollNo });
    localStorage.setItem('students', JSON.stringify(storage.students));
    this.reset();
    loadStudents();
});

function editStudent(id) {
    const student = storage.students.find(s => s.id === id);
    document.getElementById('studentName').value = student.name;
    document.getElementById('rollNo').value = student.rollNo;
    document.getElementById('studentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      student.name = document.getElementById('studentName').value;
      student.rollNo = document.getElementById('rollNo').value;
      localStorage.setItem('students', JSON.stringify(storage.students));
      document.getElementById('studentForm').removeEventListener('submit', arguments.callee);
      loadStudents();
      deleteStudent(id);
    });
  }

function loadStudents() {
    const list = document.getElementById('studentsList');
    list.innerHTML = storage.students.map(student => `
        <div class="bg-white p-4 rounded shadow">
            <h3 class="font-semibold">${student.name}</h3>
            <p class="text-gray-600">Roll No: ${student.rollNo}</p>
            <button onclick="deleteStudent(${student.id})" class="mt-2 text-red-500 hover:text-red-700">
                <i class="bi bi-trash"></i> Delete
            </button>
            <button onclick="editStudent(${student.id})" class="text-gray-600">Edit</button>
        </div>
    `).join('');
}

function deleteStudent(id) {
    storage.students = storage.students.filter(s => s.id !== id);
    localStorage.setItem('students', JSON.stringify(storage.students));
    loadStudents();
}

// Subject management
document.getElementById('subjectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;
    const code = document.getElementById('subjectCode').value;
    const teacher = document.getElementById('teacherName').value;
    storage.subjects.push({ id: Date.now(), name, code, teacher });
    localStorage.setItem('subjects', JSON.stringify(storage.subjects));
    this.reset();
    loadSubjects();
});

function loadSubjects() {
    const list = document.getElementById('subjectsList');
    list.innerHTML = storage.subjects.map(subject => `
        <div class="bg-white p-4 rounded shadow">
            <h3 class="font-semibold">${subject.name}</h3>
            <p class="text-gray-600">Code: ${subject.code}</p>
            <p class="text-gray-600">Teacher: ${subject.teacher}</p>
            <button onclick="deleteSubject(${subject.id})" class="mt-2 text-red-500 hover:text-red-700">
                <i class="bi bi-trash"></i> Delete
            </button>
            <button onclick="editSubject(${subject.id})" class="text-gray-600">Edit
            </button>
        </div>
    `).join('');

    updateSubjectSelect();
}

function updateSubjectSelect() {
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="">Select Subject</option>' + 
        storage.subjects.map(subject => `<option value="${subject.id}">${subject.name}</option>`).join('');
}

function deleteSubject(id) {
    storage.subjects = storage.subjects.filter(s => s.id !== id);
    localStorage.setItem('subjects', JSON.stringify(storage.subjects));
    loadSubjects();
}

function editSubject(id) {
    const subject = storage.subjects.find(s => s.id === id);
    document.getElementById('subjectName').value = subject.name;
    document.getElementById('subjectCode').value = subject.code;
    document.getElementById('teacherName').value = subject.teacher;
    document.getElementById('subjectForm').addEventListener('submit', (e) => {
      e.preventDefault();
      subject.name = document.getElementById('subjectName').value;
      subject.code = document.getElementById('subjectCode').value;
      subject.teacher = document.getElementById('teacherName').value;
      localStorage.setItem('subjects', JSON.stringify(storage.subjects));
      document.getElementById('subjectForm').removeEventListener('submit', arguments.callee);
      loadSubjects();
      deleteSubject(id);
    });
  }
  

// Timetable management
function addTimeSlot() {
    document.getElementById('timetableModal').classList.remove('hidden');
    document.getElementById('timetableModal').classList.add('flex');
    
    const modalSubjects = document.getElementById('modalSubjectSelects');
    modalSubjects.innerHTML = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => `
        <div class="mb-2">
            <label>${day}</label>
            <select id="${day.toLowerCase()}Subject" class="w-full p-2 border rounded">
                <option value="">No Class</option>
                ${storage.subjects.map(subject => `<option value="${subject.id}">${subject.name}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

function deleteAllTimeSlots() {
    storage.timetable = [];
    localStorage.setItem('timetable', JSON.stringify(storage.timetable));
    loadTimetable();
  }

function closeTimetableModal() {
    document.getElementById('timetableModal').classList.add('hidden');
    document.getElementById('timetableModal').classList.remove('flex');
}

function saveTimetableSlot() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    const slot = {
        time: `${startTime} - ${endTime}`,
        schedule: {}
    };

    days.forEach(day => {
        const subjectId = document.getElementById(`${day}Subject`).value;
        slot.schedule[day] = subjectId ? storage.subjects.find(s => s.id == subjectId) : null;
    });

    storage.timetable.push(slot);
    localStorage.setItem('timetable', JSON.stringify(storage.timetable));
    closeTimetableModal();
    loadTimetable();
}

function loadTimetable() {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = storage.timetable.map((slot, index) => `
      <tr>
        <td class="p-4 border">${slot.time}</td>
        ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => `
          <td class="p-4 border">
            ${slot.schedule[day] ? `
              <div class="font-semibold">${slot.schedule[day].name}</div>
              <div class="text-sm text-gray-600">${slot.schedule[day].teacher}</div>
              <button onclick="editTimetableSlot(${index}, '${day}')" class="text-blue-500 hover:text-blue-700">Edit</button>
              <button onclick="deleteTimetableSlot(${index})" class="text-red-500 hover:text-red-700">Delete Slot</button>
            ` : '-'}
          </td>
        `).join('')}
      </tr>
    `).join('');
  }

function deleteTimetableSlot(index) {
    storage.timetable.splice(index, 1);
    localStorage.setItem('timetable', JSON.stringify(storage.timetable));
    loadTimetable();
}

function editTimetableSlot(index) {
    const slot = storage.timetable[index];
    // const selectedSubjectId = slot.schedule[day]?.id;
    document.getElementById('timetableModal').classList.remove('hidden');
    document.getElementById('timetableModal').classList.add('flex');
  
    // Populate the modal fields with the current slot data
    document.getElementById('startTime').value = slot.time.split(' - ')[0];
    document.getElementById('endTime').value = slot.time.split(' - ')[1];
  
    const modalSubjects = document.getElementById('modalSubjectSelects');
    modalSubjects.innerHTML = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => `
      <div class="mb-2">
        <label>${day}</label>
        <select id="${day.toLowerCase()}Subject" class="w-full p-2 border rounded">
          <option value="">No Class</option>
           ${storage.subjects.map(subject => `<option value="${subject.id}" ${slot.schedule[day.toLowerCase()]?.id === subject.id ? 'selected' : ''}>${subject.name}</option>`).join('')}
        </select>
      </div>
    `).join('');
    // modalSubjects.innerHTML = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => `
    //     <div class="mb-2">
    //       <label>${d}</label>
    //       <select id="${d.toLowerCase()}Subject" class="w-full p-2 border rounded">
    //         <option value="">No Class</option>
    //         ${storage.subjects.map(subject => `<option value="${subject.id}" ${selectedSubjectId === subject.id ? 'selected' : ''}>${subject.name}</option>`).join('')}
    //       </select>
    //     </div>
    //   `).join('');    
  
    // Change the save button's onclick handler to update the existing slot
    document.getElementById('timetableModal').querySelector('button[onclick="saveTimetableSlot()"]').onclick = () => saveEditedTimetableSlot(index);
  }

function saveEditedTimetableSlot(index) {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const slot = {
        time: `${startTime} - ${endTime}`,
        schedule: {}
    };

    days.forEach(day => {
        const subjectId = document.getElementById(`${day}Subject`).value;
        slot.schedule[day] = subjectId ? storage.subjects.find(s => s.id == subjectId) : null;
    });

    storage.timetable[index] = slot;
    localStorage.setItem('timetable', JSON.stringify(storage.timetable));
    closeTimetableModal();
    loadTimetable();
}

// Attendance management
function loadAttendanceView() {
    const subjectId = document.getElementById('subjectSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if (!subjectId || !date) return;

    const attendanceKey = `${date}-${subjectId}`;
    const currentAttendance = storage.attendance[attendanceKey] || {};

    const list = document.getElementById('attendanceList');
    list.innerHTML = storage.students.map(student => `
        <div class="flex items-center justify-between p-4 bg-white rounded shadow">
            <div>
                <h3 class="font-semibold">${student.name}</h3>
                <p class="text-gray-600">Roll No: ${student.rollNo}</p>
            </div>
            <div class="space-x-2">
                <button onclick="markAttendance('${attendanceKey}', ${student.id}, true)" 
                        class="px-4 py-2 rounded ${currentAttendance[student.id] === true ? 'bg-green-500 text-white' : 'bg-gray-200'}">
                    Present
                </button>
                <button onclick="markAttendance('${attendanceKey}', ${student.id}, false)" 
                        class="px-4 py-2 rounded ${currentAttendance[student.id] === false ? 'bg-red-500 text-white' : 'bg-gray-200'}">
                    Absent
                </button>
            </div>
        </div>
    `).join('');
}

function markAttendance(key, studentId, present) {
    if (!storage.attendance[key]) storage.attendance[key] = {};
    storage.attendance[key][studentId] = present;
    localStorage.setItem('attendance', JSON.stringify(storage.attendance));
    loadAttendanceView();
}

// Initialize views
loadStudents();
loadSubjects();
document.getElementById('attendanceDate').valueAsDate = new Date();
showSection('students');