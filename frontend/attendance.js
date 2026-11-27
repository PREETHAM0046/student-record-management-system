// ===============================
// CHECK TEACHER LOGIN
// ===============================

const teacher =
    JSON.parse(localStorage.getItem("teacher"));

if (!teacher) {

    window.location.href =
        "teacher-login.html";

}


// ===============================
// VARIABLES
// ===============================

let sectionStudents = [];


// ===============================
// SET TODAY'S DATE
// ===============================

function setTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    document
        .getElementById("attendanceDate")
        .value =
        `${year}-${month}-${day}`;

}


// ===============================
// LOAD CLASS OPTIONS
// ===============================

async function loadClassOptions() {

    const semesterSelect =
        document.getElementById("semester");

    const branchSelect =
        document.getElementById("branch");

    const sectionSelect =
        document.getElementById("section");


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/attendance/classes"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load class options"
            );

        }


        // Load semesters

        populateDropdown(
            semesterSelect,
            data.semesters,
            "Semester"
        );


        // Load branches

        populateDropdown(
            branchSelect,
            data.branches,
            "Branch"
        );


        // Section starts empty

        sectionSelect.innerHTML = `

            <option value="">
                Select Section
            </option>

        `;


    } catch (error) {

        console.error(
            "Error loading class options:",
            error
        );


        alert(
            "❌ Unable to load class options. Make sure the backend server is running."
        );

    }

}


// ===============================
// SEMESTER CHANGE
// ===============================

document
    .getElementById("semester")
    .addEventListener(
        "change",
        loadSections
    );


// ===============================
// BRANCH CHANGE
// ===============================

document
    .getElementById("branch")
    .addEventListener(
        "change",
        loadSections
    );


// ===============================
// LOAD SECTIONS
// ===============================

async function loadSections() {

    const semester =
        document
            .getElementById("semester")
            .value;

    const branch =
        document
            .getElementById("branch")
            .value;

    const sectionSelect =
        document
            .getElementById("section");


    // Reset previous section

    sectionSelect.innerHTML = `

        <option value="">
            Select Section
        </option>

    `;


    // Need both semester and branch

    if (
        !semester ||
        !branch
    ) {

        return;

    }


    sectionSelect.innerHTML = `

        <option value="">
            Loading sections...
        </option>

    `;


    try {

        const response =
            await fetch(

                `http://localhost:5000/api/attendance/sections` +

                `?semester=${encodeURIComponent(semester)}` +

                `&branch=${encodeURIComponent(branch)}`

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load sections"
            );

        }


        sectionSelect.innerHTML = `

            <option value="">
                Select Section
            </option>

        `;


        if (
            !data.sections ||
            data.sections.length === 0
        ) {

            sectionSelect.innerHTML = `

                <option value="">
                    No sections found
                </option>

            `;

            return;

        }


        data.sections.forEach(
            section => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    section;


                option.textContent =
                    `Section ${section}`;


                sectionSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading sections:",
            error
        );


        sectionSelect.innerHTML = `

            <option value="">
                Unable to load sections
            </option>

        `;

    }

}


// ===============================
// POPULATE DROPDOWN
// ===============================

function populateDropdown(
    select,
    values,
    label
) {

    select.innerHTML = `

        <option value="">
            Select ${label}
        </option>

    `;


    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            if (
                label === "Semester"
            ) {

                option.textContent =
                    `${value}${getSemesterSuffix(value)} Semester`;

            } else {

                option.textContent =
                    value;

            }


            select.appendChild(
                option
            );

        }
    );

}


// ===============================
// SEMESTER SUFFIX
// ===============================

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


// ===============================
// LOAD SECTION STUDENTS
// ===============================

async function loadSection() {

    const semester =
        document
            .getElementById("semester")
            .value;

    const branch =
        document
            .getElementById("branch")
            .value;

    const section =
        document
            .getElementById("section")
            .value;

    const date =
        document
            .getElementById("attendanceDate")
            .value;


    if (
        !semester ||
        !branch ||
        !section ||
        !date
    ) {

        alert(
            "⚠️ Please select semester, branch, section and date."
        );

        return;

    }


    const studentContainer =
        document.getElementById(
            "sectionStudents"
        );


    studentContainer.innerHTML = `

        <div class="attendance-empty">

            <div>
                ⏳
            </div>

            <h3>
                Loading Students...
            </h3>

            <p>
                Please wait.
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(

                `http://localhost:5000/api/attendance/section` +

                `?date=${encodeURIComponent(date)}` +

                `&semester=${encodeURIComponent(semester)}` +

                `&branch=${encodeURIComponent(branch)}` +

                `&section=${encodeURIComponent(section)}`

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load students"
            );

        }


        sectionStudents =
            data.students || [];


        displaySectionStudents();


        updateClassInfo(
            semester,
            branch,
            section
        );


    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        studentContainer.innerHTML = `

            <div class="attendance-empty">

                <div>
                    ⚠️
                </div>

                <h3>
                    Unable to load students
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>

            </div>

        `;

        hideAttendanceControls();

    }

}


// ===============================
// DISPLAY STUDENTS
// ===============================

function displaySectionStudents() {

    const container =
        document.getElementById(
            "sectionStudents"
        );


    if (
        sectionStudents.length === 0
    ) {

        container.innerHTML = `

            <div class="attendance-empty">

                <div>
                    👨‍🎓
                </div>

                <h3>
                    No Students Found
                </h3>

                <p>
                    No students belong to this class.
                </p>

            </div>

        `;


        hideAttendanceControls();

        return;

    }


    container.innerHTML = "";


    sectionStudents.forEach(
        (student, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "section-attendance-card";


            const currentStatus =
                student.status;


            card.innerHTML = `

                <div class="section-student-number">
                    ${index + 1}
                </div>


                <div class="section-student-info">

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

                    </div>

                </div>


                <div class="attendance-buttons">

                    <button
                        type="button"
                        class="attendance-present-button ${
                            currentStatus === "Present"
                                ? "selected-present"
                                : ""
                        }"
                        onclick="setAttendance(
                            ${student.studentId},
                            'Present'
                        )"
                    >
                        ✅ Present
                    </button>


                    <button
                        type="button"
                        class="attendance-absent-button ${
                            currentStatus === "Absent"
                                ? "selected-absent"
                                : ""
                        }"
                        onclick="setAttendance(
                            ${student.studentId},
                            'Absent'
                        )"
                    >
                        ❌ Absent
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    showAttendanceControls();

    updateAttendanceCount();

}


// ===============================
// SET INDIVIDUAL ATTENDANCE
// ===============================

function setAttendance(
    studentId,
    status
) {

    const student =
        sectionStudents.find(
            item =>
                item.studentId ===
                studentId
        );


    if (!student) {

        return;

    }


    student.status =
        status;


    displaySectionStudents();

}


// ===============================
// MARK ALL PRESENT
// ===============================

function markAllPresent() {

    if (
        sectionStudents.length === 0
    ) {

        return;

    }


    sectionStudents.forEach(
        student => {

            student.status =
                "Present";

        }
    );


    displaySectionStudents();

}


// ===============================
// MARK ALL ABSENT
// ===============================

function markAllAbsent() {

    if (
        sectionStudents.length === 0
    ) {

        return;

    }


    sectionStudents.forEach(
        student => {

            student.status =
                "Absent";

        }
    );


    displaySectionStudents();

}


// ===============================
// SAVE SECTION ATTENDANCE
// ===============================

async function saveSectionAttendance() {

    if (
        sectionStudents.length === 0
    ) {

        alert(
            "⚠️ No students to save."
        );

        return;

    }


    const semester =
        document
            .getElementById("semester")
            .value;

    const branch =
        document
            .getElementById("branch")
            .value;

    const section =
        document
            .getElementById("section")
            .value;

    const date =
        document
            .getElementById("attendanceDate")
            .value;


    // Check unmarked students

    const unmarkedStudents =
        sectionStudents.filter(
            student =>
                !student.status
        );


    if (
        unmarkedStudents.length > 0
    ) {

        alert(

            `⚠️ ${unmarkedStudents.length} student(s) have not been marked.\n\n` +

            `Please mark everyone Present or Absent.`

        );

        return;

    }


    const presentCount =
        sectionStudents.filter(
            student =>
                student.status ===
                "Present"
        ).length;


    const absentCount =
        sectionStudents.filter(
            student =>
                student.status ===
                "Absent"
        ).length;


    const confirmed =
        confirm(

            `Save attendance?\n\n` +

            `Date: ${formatDate(date)}\n` +

            `Class: ${branch} - Semester ${semester} - Section ${section}\n\n` +

            `Present: ${presentCount}\n` +

            `Absent: ${absentCount}\n\n` +

            `Click OK to save.`

        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(

                "http://localhost:5000/api/attendance/section",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            date:
                                date,

                            semester:
                                semester,

                            branch:
                                branch,

                            section:
                                section,

                            records:
                                sectionStudents.map(
                                    student => ({

                                        studentId:
                                            student.studentId,

                                        status:
                                            student.status

                                    })
                                )

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to save attendance."
            );

            return;

        }


        alert(
            "✅ Section attendance saved successfully!"
        );


        // Reload saved attendance

        await loadSection();


    } catch (error) {

        console.error(
            "Error saving attendance:",
            error
        );


        alert(
            "❌ Cannot connect to server."
        );

    }

}


// ===============================
// UPDATE CLASS INFORMATION
// ===============================

function updateClassInfo(
    semester,
    branch,
    section
) {

    document
        .getElementById("classTitle")
        .textContent =
        `${branch} - Section ${section}`;


    document
        .getElementById("classSubtitle")
        .textContent =
        `Semester ${semester} • Attendance`;


    document
        .getElementById("studentCount")
        .textContent =
        sectionStudents.length;


    document
        .getElementById("classInfo")
        .classList
        .remove("hidden");

}


// ===============================
// SHOW ATTENDANCE CONTROLS
// ===============================

function showAttendanceControls() {

    document
        .getElementById("quickActions")
        .classList
        .remove("hidden");


    document
        .getElementById("saveAttendanceArea")
        .classList
        .remove("hidden");

}


// ===============================
// HIDE ATTENDANCE CONTROLS
// ===============================

function hideAttendanceControls() {

    document
        .getElementById("quickActions")
        .classList
        .add("hidden");


    document
        .getElementById("saveAttendanceArea")
        .classList
        .add("hidden");


    document
        .getElementById("classInfo")
        .classList
        .add("hidden");

}


// ===============================
// UPDATE ATTENDANCE COUNT
// ===============================

function updateAttendanceCount() {

    const present =
        sectionStudents.filter(
            student =>
                student.status ===
                "Present"
        ).length;


    const absent =
        sectionStudents.filter(
            student =>
                student.status ===
                "Absent"
        ).length;


    const total =
        sectionStudents.length;


    const saveArea =
        document.getElementById(
            "saveAttendanceArea"
        );


    if (!saveArea) {

        return;

    }


    const strong =
        saveArea.querySelector(
            "strong"
        );


    if (strong) {

        strong.textContent =

            `${present} Present • ` +

            `${absent} Absent • ` +

            `${total - present - absent} Unmarked`;

    }

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


// ===============================
// BACK BUTTON
// ===============================

function goBack() {

    window.location.href =
        "teacher-dashboard.html";

}


// ===============================
// START APPLICATION
// ===============================

setTodayDate();

loadClassOptions();