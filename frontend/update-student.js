// ===============================
// CHECK TEACHER LOGIN
// ===============================

const teacher = JSON.parse(localStorage.getItem("teacher"));

if (!teacher) {

    window.location.href = "teacher-login.html";

}


// ===============================
// VARIABLES
// ===============================

let allStudents = [];

let selectedStudent = null;


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

                <div class="empty-icon">⚠️</div>

                <h3>Unable to load students</h3>

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

                <div class="empty-icon">👨‍🎓</div>

                <h3>No Students Found</h3>

                <p>
                    Try a different name or USN.
                </p>

            </div>

        `;

        return;

    }


    studentResults.innerHTML = "";


    students.forEach(student => {


        const card =
            document.createElement("div");


        card.className = "update-student-card";


        card.innerHTML = `

            <div class="update-student-info">

                <div class="student-avatar">

                    👨‍🎓

                </div>


                <div>

                    <h3>${student.name}</h3>

                    <p>${student.usn}</p>

                </div>

            </div>


            <button
                class="edit-button"
                onclick="selectStudent(${student.id})"
            >

                ✏️ Edit

            </button>

        `;


        studentResults.appendChild(card);

    });

}


// ===============================
// SEARCH
// ===============================

const searchInput =
    document.getElementById("searchStudent");


searchInput.addEventListener("input", function() {


    const searchText =
        searchInput.value.trim().toLowerCase();


    const filteredStudents =
        allStudents.filter(student =>

            student.name.toLowerCase().includes(searchText) ||

            student.usn.toLowerCase().includes(searchText)

        );


    displayStudents(filteredStudents);

});


// ===============================
// SELECT STUDENT
// ===============================

function selectStudent(studentId) {


    selectedStudent =
        allStudents.find(
            student => student.id === studentId
        );


    if (!selectedStudent) {

        return;

    }


    // Fill form

    document.getElementById("editName").value =
        selectedStudent.name;

    document.getElementById("editUSN").value =
        selectedStudent.usn;

    document.getElementById("editBranch").value =
        selectedStudent.branch;

    document.getElementById("editSemester").value =
        selectedStudent.semester;

    document.getElementById("editSection").value =
        selectedStudent.section;

    document.getElementById("editEmail").value =
        selectedStudent.email;

    document.getElementById("editPhone").value =
        selectedStudent.phone;


    // Show form

    document
        .getElementById("editStudentArea")
        .classList.remove("hidden");


    // Scroll to form

    document
        .getElementById("editStudentArea")
        .scrollIntoView({

            behavior: "smooth"

        });

}


// ===============================
// UPDATE STUDENT
// ===============================

const updateForm =
    document.getElementById("updateStudentForm");


updateForm.addEventListener(
    "submit",
    async function(event) {


        event.preventDefault();


        if (!selectedStudent) {

            alert("Please select a student first.");

            return;

        }


        const updatedStudent = {

            name:
                document.getElementById("editName").value.trim(),

            usn:
                document.getElementById("editUSN").value.trim(),

            branch:
                document.getElementById("editBranch").value.trim(),

            semester:
                document.getElementById("editSemester").value,

            section:
                document.getElementById("editSection").value.trim(),

            email:
                document.getElementById("editEmail").value.trim(),

            phone:
                document.getElementById("editPhone").value.trim()

        };


        try {


            const response = await fetch(

                `http://localhost:5000/api/students/${selectedStudent.id}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(updatedStudent)

                }

            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to update student."
                );

                return;

            }


            alert("✅ Student updated successfully!");


            // Update local data

            const index =
                allStudents.findIndex(
                    student =>
                        student.id === selectedStudent.id
                );


            if (index !== -1) {

                allStudents[index] =
                    data.student;

            }


            selectedStudent =
                data.student;


            // Hide edit form

            document
                .getElementById("editStudentArea")
                .classList.add("hidden");


            // Clear search

            searchInput.value = "";


            // Display updated list

            displayStudents(allStudents);


        } catch (error) {

            console.error("Error:", error);

            alert("❌ Cannot connect to server.");

        }

    }
);


// ===============================
// CANCEL EDIT
// ===============================

function cancelEdit() {

    selectedStudent = null;


    document
        .getElementById("editStudentArea")
        .classList.add("hidden");

}


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