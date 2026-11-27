const teacher = JSON.parse(localStorage.getItem("teacher"));

if (!teacher) {
    window.location.href = "teacher-login.html";
}

let allStudents = [];

// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const container =
        document.getElementById("studentsContainer");

    try {

        const response = await fetch(
            "/api/students"
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load students"
            );
        }

        allStudents = data.students || [];

        updateStatistics();
        populateFilters();
        displayStudents();

    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );

        container.innerHTML = `
            <div class="student-loading-state">
                <div>⚠️</div>

                <h3>
                    Unable to Load Students
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>
            </div>
        `;

    }

}

// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    document.getElementById("totalStudents")
        .textContent = allStudents.length;

    const branches =
        new Set(
            allStudents.map(
                student => student.branch
            )
        );

    const semesters =
        new Set(
            allStudents.map(
                student => student.semester
            )
        );

    const sections =
        new Set(
            allStudents.map(
                student => student.section
            )
        );

    document.getElementById("totalBranches")
        .textContent = branches.size;

    document.getElementById("totalSemesters")
        .textContent = semesters.size;

    document.getElementById("totalSections")
        .textContent = sections.size;

}

// ==========================================
// POPULATE FILTERS
// ==========================================

function populateFilters() {

    const branchFilter =
        document.getElementById("branchFilter");

    const semesterFilter =
        document.getElementById("semesterFilter");

    const sectionFilter =
        document.getElementById("sectionFilter");


    const branches =
        [...new Set(
            allStudents.map(
                student => student.branch
            )
        )].sort();


    const semesters =
        [...new Set(
            allStudents.map(
                student => student.semester
            )
        )].sort(
            (a, b) => Number(a) - Number(b)
        );


    const sections =
        [...new Set(
            allStudents.map(
                student => student.section
            )
        )].sort();


    branches.forEach(
        branch => {

            const option =
                document.createElement("option");

            option.value = branch;
            option.textContent = branch;

            branchFilter.appendChild(option);

        }
    );


    semesters.forEach(
        semester => {

            const option =
                document.createElement("option");

            option.value = semester;

            option.textContent =
                `${semester}${getSemesterSuffix(semester)} Semester`;

            semesterFilter.appendChild(option);

        }
    );


    sections.forEach(
        section => {

            const option =
                document.createElement("option");

            option.value = section;

            option.textContent =
                `Section ${section}`;

            sectionFilter.appendChild(option);

        }
    );

}

// ==========================================
// DISPLAY STUDENTS
// ==========================================

function displayStudents() {

    const container =
        document.getElementById(
            "studentsContainer"
        );

    const search =
        document.getElementById(
            "studentSearch"
        ).value
        .trim()
        .toLowerCase();

    const branch =
        document.getElementById(
            "branchFilter"
        ).value;

    const semester =
        document.getElementById(
            "semesterFilter"
        ).value;

    const section =
        document.getElementById(
            "sectionFilter"
        ).value;


    const filteredStudents =
        allStudents.filter(
            student => {

                const matchesSearch =
                    !search ||
                    student.name
                        .toLowerCase()
                        .includes(search) ||
                    student.usn
                        .toLowerCase()
                        .includes(search);


                const matchesBranch =
                    !branch ||
                    student.branch === branch;


                const matchesSemester =
                    !semester ||
                    String(student.semester) ===
                    String(semester);


                const matchesSection =
                    !section ||
                    student.section === section;


                return (
                    matchesSearch &&
                    matchesBranch &&
                    matchesSemester &&
                    matchesSection
                );

            }
        );


    document.getElementById(
        "resultCount"
    ).textContent =
        `${filteredStudents.length} student${
            filteredStudents.length === 1
                ? ""
                : "s"
        } found`;


    if (filteredStudents.length === 0) {

        container.innerHTML = `
            <div class="student-loading-state">
                <div>🔍</div>

                <h3>
                    No Students Found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML = "";


    filteredStudents.forEach(
        (student, index) => {

            const card =
                document.createElement("div");

            card.className =
                "student-record-card";


            card.innerHTML = `

                <div class="student-record-number">
                    ${index + 1}
                </div>


                <div class="student-record-main">

                    <div class="student-record-avatar">
                        ${getInitials(student.name)}
                    </div>

                    <div class="student-record-name">

                        <h3>
                            ${escapeHTML(student.name)}
                        </h3>

                        <span>
                            🆔 ${escapeHTML(student.usn)}
                        </span>

                    </div>

                </div>


                <div class="student-record-info">

                    <span>
                        💻 ${escapeHTML(student.branch)}
                    </span>

                    <span>
                        🎓 ${student.semester}${getSemesterSuffix(student.semester)} Sem
                    </span>

                    <span>
                        👥 Section ${escapeHTML(student.section)}
                    </span>

                </div>


                <div class="student-record-contact">

                    <span>
                        📧 ${escapeHTML(student.email)}
                    </span>

                    <span>
                        📱 ${escapeHTML(student.phone)}
                    </span>

                </div>


                <div class="student-record-actions">

                    <button
                        class="student-view-button"
                        onclick="viewStudent(${student.id})"
                    >
                        👁️ View
                    </button>

                    <button
                        class="student-edit-button"
                        onclick="editStudent(${student.id})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="student-delete-button"
                        onclick="deleteStudent(${student.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}

// ==========================================
// SEARCH + FILTER EVENTS
// ==========================================

document
    .getElementById("studentSearch")
    .addEventListener(
        "input",
        displayStudents
    );


document
    .getElementById("branchFilter")
    .addEventListener(
        "change",
        displayStudents
    );


document
    .getElementById("semesterFilter")
    .addEventListener(
        "change",
        displayStudents
    );


document
    .getElementById("sectionFilter")
    .addEventListener(
        "change",
        displayStudents
    );

// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

    document.getElementById(
        "studentSearch"
    ).value = "";

    document.getElementById(
        "branchFilter"
    ).value = "";

    document.getElementById(
        "semesterFilter"
    ).value = "";

    document.getElementById(
        "sectionFilter"
    ).value = "";

    displayStudents();

}

// ==========================================
// VIEW STUDENT
// ==========================================

function viewStudent(id) {

    const student =
        allStudents.find(
            item => item.id === id
        );

    if (!student) {
        return;
    }

    alert(
        `STUDENT PROFILE\n\n` +
        `Name: ${student.name}\n` +
        `USN: ${student.usn}\n` +
        `Branch: ${student.branch}\n` +
        `Semester: ${student.semester}\n` +
        `Section: ${student.section}\n` +
        `Email: ${student.email}\n` +
        `Phone: ${student.phone}`
    );

}

// ==========================================
// EDIT STUDENT
// ==========================================

function editStudent(id) {

    localStorage.setItem(
        "editStudentId",
        id
    );

    window.location.href =
        "update-student.html";

}

// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(id) {

    const student =
        allStudents.find(
            item => item.id === id
        );

    if (!student) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name}?\n\n` +
            `USN: ${student.usn}\n\n` +
            `This will also remove their marks and attendance records.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete student"
            );

        }


        allStudents =
            allStudents.filter(
                item => item.id !== id
            );


        updateStatistics();
        displayStudents();


        alert(
            "✅ Student deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Unable to delete student."
            )
        );

    }

}

// ==========================================
// NAVIGATION
// ==========================================

function goToDashboard() {

    window.location.href =
        "teacher-dashboard.html";

}


function goToAddStudent() {

    window.location.href =
        "add-student.html";

}

// ==========================================
// INITIALS
// ==========================================

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
                    .toUpperCase()
        )
        .join("");

}

// ==========================================
// SEMESTER SUFFIX
// ==========================================

function getSemesterSuffix(
    semester
) {

    const number =
        Number(semester);

    if (number === 1)
        return "st";

    if (number === 2)
        return "nd";

    if (number === 3)
        return "rd";

    return "th";

}

// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}

// ==========================================
// START
// ==========================================

loadStudents();