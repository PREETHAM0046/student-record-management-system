// ===============================
// CHECK TEACHER LOGIN
// ===============================

const teacher =
    JSON.parse(localStorage.getItem("teacher"));

if (!teacher) {

    window.location.href = "teacher-login.html";

}


// ===============================
// VARIABLES
// ===============================

let allStudents = [];


// ===============================
// LOAD STUDENTS
// ===============================

async function loadStudents() {

    const studentResults =
        document.getElementById("studentResults");

    studentResults.innerHTML = `
        <p class="loading-text">
            ⏳ Loading students...
        </p>
    `;

    try {

        const response = await fetch(
            "http://localhost:5000/api/students"
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load students"
            );

        }

        allStudents = data.students || [];

        displayStudents(allStudents);

    } catch (error) {

        console.error("Error:", error);

        studentResults.innerHTML = `
            <div class="empty-students">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load students
                </h3>

                <p>
                    Please make sure the backend server is running.
                </p>

            </div>
        `;

    }

}


// ===============================
// DISPLAY STUDENTS
// ===============================

function displayStudents(students) {

    const studentResults =
        document.getElementById("studentResults");


    if (students.length === 0) {

        studentResults.innerHTML = `
            <div class="empty-students">

                <div class="empty-icon">
                    👨‍🎓
                </div>

                <h3>
                    No Students Found
                </h3>

                <p>
                    There are no student records to delete.
                </p>

            </div>
        `;

        return;

    }


    studentResults.innerHTML = "";


    students.forEach(student => {

        const card =
            document.createElement("div");

        card.className =
            "delete-student-card";


        card.innerHTML = `

            <div class="delete-student-info">

                <div class="student-avatar">
                    👨‍🎓
                </div>

                <div>

                    <h3>
                        ${student.name}
                    </h3>

                    <p>
                        ${student.usn}
                    </p>

                    <small>
                        ${student.branch}
                        • Semester ${student.semester}
                        • Section ${student.section}
                    </small>

                </div>

            </div>


            <button
                class="delete-confirm-button"
                onclick="deleteStudent(${student.id})"
            >

                🗑️ Delete

            </button>

        `;

        studentResults.appendChild(card);

    });

}


// ===============================
// DELETE STUDENT
// ===============================

async function deleteStudent(studentId) {

    const student =
        allStudents.find(
            student => student.id === studentId
        );


    if (!student) {

        alert("Student not found.");

        return;

    }


    const confirmed = confirm(

        `⚠️ Delete Student?\n\n` +

        `Name: ${student.name}\n` +

        `USN: ${student.usn}\n\n` +

        `This will permanently remove the student record and their marks.\n\n` +

        `Are you sure?`

    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(

            `http://localhost:5000/api/students/${studentId}`,

            {
                method: "DELETE"
            }

        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete student."
            );

            return;

        }


        alert(
            "✅ Student deleted successfully!"
        );


        // Remove deleted student from current list

        allStudents =
            allStudents.filter(
                student => student.id !== studentId
            );


        // Refresh displayed list

        const searchText =
            document
                .getElementById("searchStudent")
                .value
                .trim()
                .toLowerCase();


        const filteredStudents =
            allStudents.filter(student =>

                student.name
                    .toLowerCase()
                    .includes(searchText)

                ||

                student.usn
                    .toLowerCase()
                    .includes(searchText)

            );


        displayStudents(filteredStudents);


    } catch (error) {

        console.error("Error:", error);

        alert(
            "❌ Cannot connect to server."
        );

    }

}


// ===============================
// SEARCH STUDENTS
// ===============================

document
    .getElementById("searchStudent")
    .addEventListener(
        "input",
        function() {

            const searchText =
                this.value
                    .trim()
                    .toLowerCase();


            const filteredStudents =
                allStudents.filter(student =>

                    student.name
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    student.usn
                        .toLowerCase()
                        .includes(searchText)

                );


            displayStudents(filteredStudents);

        }
    );


// ===============================
// BACK BUTTON
// ===============================

function goBack() {

    window.location.href =
        "teacher-dashboard.html";

}


// ===============================
// START
// ===============================

loadStudents();