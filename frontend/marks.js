// ==================================================
// MARKS MANAGEMENT
// ==================================================

const teacher = JSON.parse(
    localStorage.getItem("teacher")
);

if (!teacher) {
    window.location.href = "teacher-login.html";
}


// ==================================================
// VARIABLES
// ==================================================

let allStudents = [];

let selectedStudentId = null;

let editingMarkId = null;


// ==================================================
// LOAD STUDENTS
// ==================================================

async function loadStudents() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/students"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load students"
            );

        }


        allStudents =
            data.students || [];


        populateClassFilters();


    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        showMessage(
            "❌ Unable to load students. Make sure backend is running.",
            "error"
        );

    }

}


// ==================================================
// POPULATE CLASS FILTERS
// ==================================================

function populateClassFilters() {

    const semesterSelect =
        document.getElementById(
            "marksSemester"
        );


    const branchSelect =
        document.getElementById(
            "marksBranch"
        );


    semesterSelect.innerHTML = `
        <option value="">
            Select Semester
        </option>
    `;


    branchSelect.innerHTML = `
        <option value="">
            Select Branch
        </option>
    `;


    const semesters =
        [
            ...new Set(
                allStudents.map(
                    student =>
                        String(
                            student.semester
                        )
                )
            )
        ].sort(
            (a, b) =>
                Number(a) - Number(b)
        );


    const branches =
        [
            ...new Set(
                allStudents.map(
                    student =>
                        student.branch
                )
            )
        ].sort();


    semesters.forEach(
        semester => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                semester;


            option.textContent =
                `${semester}${getSemesterSuffix(
                    semester
                )} Semester`;


            semesterSelect.appendChild(
                option
            );

        }
    );


    branches.forEach(
        branch => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                branch;


            option.textContent =
                branch;


            branchSelect.appendChild(
                option
            );

        }
    );

}


// ==================================================
// SEMESTER CHANGE
// ==================================================

document
    .getElementById("marksSemester")
    .addEventListener(
        "change",
        updateSections
    );


// ==================================================
// BRANCH CHANGE
// ==================================================

document
    .getElementById("marksBranch")
    .addEventListener(
        "change",
        updateSections
    );


// ==================================================
// UPDATE SECTIONS
// ==================================================

function updateSections() {

    const semester =
        document.getElementById(
            "marksSemester"
        ).value;


    const branch =
        document.getElementById(
            "marksBranch"
        ).value;


    const sectionSelect =
        document.getElementById(
            "marksSection"
        );


    sectionSelect.innerHTML = `
        <option value="">
            Select Section
        </option>
    `;


    resetStudentSelection();


    if (
        !semester ||
        !branch
    ) {

        return;

    }


    const sections =
        [
            ...new Set(

                allStudents

                    .filter(
                        student =>

                            String(
                                student.semester
                            ) ===
                            String(
                                semester
                            )

                            &&

                            String(
                                student.branch
                            ).toLowerCase() ===
                            String(
                                branch
                            ).toLowerCase()
                    )

                    .map(
                        student =>
                            student.section
                    )

            )
        ].sort();


    sections.forEach(
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

}


// ==================================================
// SECTION CHANGE
// ==================================================

document
    .getElementById("marksSection")
    .addEventListener(
        "change",
        loadStudentsForClass
    );


// ==================================================
// LOAD STUDENTS FOR SELECTED CLASS
// ==================================================

function loadStudentsForClass() {

    const semester =
        document.getElementById(
            "marksSemester"
        ).value;


    const branch =
        document.getElementById(
            "marksBranch"
        ).value;


    const section =
        document.getElementById(
            "marksSection"
        ).value;


    const studentSelect =
        document.getElementById(
            "marksStudent"
        );


    studentSelect.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;


    selectedStudentId = null;


    clearStudentInfo();

    clearMarksForm();

    clearMessage();


    if (
        !semester ||
        !branch ||
        !section
    ) {

        showNoStudentMessage();

        return;

    }


    const students =
        allStudents.filter(
            student =>

                String(
                    student.semester
                ) ===
                String(
                    semester
                )

                &&

                String(
                    student.branch
                ).toLowerCase() ===
                String(
                    branch
                ).toLowerCase()

                &&

                String(
                    student.section
                ).toLowerCase() ===
                String(
                    section
                ).toLowerCase()
        );


    students.forEach(
        student => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                student.id;


            option.textContent =
                `${student.name} — ${student.usn}`;


            studentSelect.appendChild(
                option
            );

        }
    );


    if (
        students.length === 0
    ) {

        studentSelect.innerHTML = `
            <option value="">
                No students found
            </option>
        `;


        document.getElementById(
            "existingMarksContainer"
        ).innerHTML = `
            <div class="marks-empty-state">

                <div class="empty-icon">
                    👨‍🎓
                </div>

                <h3>
                    No Students Found
                </h3>

                <p>
                    No students are registered
                    in this class.
                </p>

            </div>
        `;

        return;

    }


    showNoStudentMessage();

}


// ==================================================
// SEARCH STUDENT
// ==================================================

document
    .getElementById(
        "marksStudentSearch"
    )
    .addEventListener(
        "input",
        filterStudentOptions
    );


// ==================================================
// FILTER STUDENTS
// ==================================================

function filterStudentOptions() {

    const search =
        document
            .getElementById(
                "marksStudentSearch"
            )
            .value
            .trim()
            .toLowerCase();


    const semester =
        document.getElementById(
            "marksSemester"
        ).value;


    const branch =
        document.getElementById(
            "marksBranch"
        ).value;


    const section =
        document.getElementById(
            "marksSection"
        ).value;


    const studentSelect =
        document.getElementById(
            "marksStudent"
        );


    studentSelect.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;


    if (
        !semester ||
        !branch ||
        !section
    ) {

        return;

    }


    const students =
        allStudents.filter(
            student => {

                const correctClass =

                    String(
                        student.semester
                    ) ===
                    String(
                        semester
                    )

                    &&

                    String(
                        student.branch
                    ).toLowerCase() ===
                    String(
                        branch
                    ).toLowerCase()

                    &&

                    String(
                        student.section
                    ).toLowerCase() ===
                    String(
                        section
                    ).toLowerCase();


                const name =
                    String(
                        student.name || ""
                    ).toLowerCase();


                const usn =
                    String(
                        student.usn || ""
                    ).toLowerCase();


                const matchesSearch =

                    !search

                    ||

                    name.includes(
                        search
                    )

                    ||

                    usn.includes(
                        search
                    );


                return (
                    correctClass &&
                    matchesSearch
                );

            }
        );


    students.forEach(
        student => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                student.id;


            option.textContent =
                `${student.name} — ${student.usn}`;


            studentSelect.appendChild(
                option
            );

        }
    );


    if (
        students.length === 0
    ) {

        studentSelect.innerHTML = `
            <option value="">
                No matching student
            </option>
        `;

    }

}


// ==================================================
// STUDENT SELECT CHANGE
// ==================================================

document
    .getElementById(
        "marksStudent"
    )
    .addEventListener(
        "change",
        handleStudentSelection
    );


// ==================================================
// HANDLE STUDENT SELECTION
// ==================================================

async function handleStudentSelection() {

    const studentId =
        document.getElementById(
            "marksStudent"
        ).value;


    selectedStudentId =
        studentId
            ? Number(studentId)
            : null;


    editingMarkId = null;


    clearMarksForm();

    clearMessage();


    if (
        !selectedStudentId
    ) {

        clearStudentInfo();

        showNoStudentMessage();

        return;

    }


    const student =
        allStudents.find(
            item =>
                Number(item.id) ===
                selectedStudentId
        );


    if (!student) {

        return;

    }


    showStudentInfo(
        student
    );


    await loadExistingMarks();

}


// ==================================================
// SHOW STUDENT INFORMATION
// ==================================================

function showStudentInfo(
    student
) {

    const container =
        document.getElementById(
            "selectedStudentInfo"
        );


    container.innerHTML = `

        <div class="selected-student-avatar">

            ${getInitials(
                student.name
            )}

        </div>


        <div class="selected-student-details">

            <strong>
                ${escapeHTML(
                    student.name
                )}
            </strong>

            <span>
                🆔
                ${escapeHTML(
                    student.usn
                )}
            </span>

        </div>


        <div class="selected-student-class">

            <span>
                💻
                ${escapeHTML(
                    student.branch
                )}
            </span>

            <span>
                🎓
                ${student.semester}
                ${getSemesterSuffix(
                    student.semester
                )}
                Semester
            </span>

            <span>
                👥
                Section
                ${escapeHTML(
                    student.section
                )}
            </span>

        </div>

    `;

}


// ==================================================
// CLEAR STUDENT INFORMATION
// ==================================================

function clearStudentInfo() {

    document.getElementById(
        "selectedStudentInfo"
    ).innerHTML = "";

}


// ==================================================
// RESET STUDENT SELECTION
// ==================================================

function resetStudentSelection() {

    const studentSelect =
        document.getElementById(
            "marksStudent"
        );


    const searchInput =
        document.getElementById(
            "marksStudentSearch"
        );


    studentSelect.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;


    searchInput.value = "";


    selectedStudentId = null;

    editingMarkId = null;


    clearStudentInfo();

    clearMarksForm();

    clearMessage();

    showNoStudentMessage();

}


// ==================================================
// EMPTY MARKS MESSAGE
// ==================================================

function showNoStudentMessage() {

    document.getElementById(
        "existingMarksContainer"
    ).innerHTML = `

        <div class="marks-empty-state">

            <div class="empty-icon">
                📚
            </div>

            <h3>
                Select a Student
            </h3>

            <p>
                Select a student to view
                their marks.
            </p>

        </div>

    `;

}


// ==================================================
// LOAD EXISTING MARKS
// ==================================================

async function loadExistingMarks() {

    const container =
        document.getElementById(
            "existingMarksContainer"
        );


    if (
        !selectedStudentId
    ) {

        showNoStudentMessage();

        return;

    }


    container.innerHTML = `

        <div class="marks-empty-state">

            <div class="empty-icon">
                ⏳
            </div>

            <h3>
                Loading Marks...
            </h3>

            <p>
                Please wait.
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/marks/${selectedStudentId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load marks"
            );

        }


        const marks =
            data.marks || [];


        if (
            marks.length === 0
        ) {

            container.innerHTML = `

                <div class="marks-empty-state">

                    <div class="empty-icon">
                        📚
                    </div>

                    <h3>
                        No Marks Added
                    </h3>

                    <p>
                        Add the first subject
                        marks above.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        marks.forEach(
            (mark, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "existing-mark-card";


                card.innerHTML = `

                    <div class="existing-mark-number">
                        ${index + 1}
                    </div>


                    <div class="existing-mark-subject">

                        <h4>
                            ${escapeHTML(
                                mark.subject
                            )}
                        </h4>

                        <span>
                            Subject
                        </span>

                    </div>


                    <div class="existing-mark-score">

                        <strong>
                            ${mark.totalMarks}
                        </strong>

                        <span>
                            / 100
                        </span>

                    </div>


                    <div class="existing-mark-details">

                        <span>
                            Internal:
                            <strong>
                                ${mark.internalMarks}
                            </strong>
                        </span>

                        <span>
                            External:
                            <strong>
                                ${mark.externalMarks}
                            </strong>
                        </span>

                    </div>


                    <div class="existing-mark-actions">

                        <button
                            class="mark-edit-button"
                            onclick="editMark(${mark.id})"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="mark-delete-button"
                            onclick="deleteMark(${mark.id})"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading marks:",
            error
        );


        container.innerHTML = `

            <div class="marks-empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Load Marks
                </h3>

                <p>
                    Make sure the backend
                    server is running.
                </p>

            </div>

        `;

    }

}


// ==================================================
// MARKS FORM
// ==================================================

document
    .getElementById(
        "marksForm"
    )
    .addEventListener(
        "submit",
        saveMarks
    );


// ==================================================
// SAVE / UPDATE MARKS
// ==================================================

async function saveMarks(
    event
) {

    event.preventDefault();


    if (
        !selectedStudentId
    ) {

        showMessage(
            "⚠️ Please select a student first.",
            "error"
        );

        return;

    }


    const subject =
        document.getElementById(
            "marksSubject"
        ).value.trim();


    const internal =
        Number(
            document.getElementById(
                "internalMarks"
            ).value
        );


    const external =
        Number(
            document.getElementById(
                "externalMarks"
            ).value
        );


    if (!subject) {

        showMessage(
            "⚠️ Please enter the subject name.",
            "error"
        );

        return;

    }


    if (

        !Number.isFinite(internal) ||
        !Number.isFinite(external) ||

        internal < 0 ||
        internal > 50 ||

        external < 0 ||
        external > 50

    ) {

        showMessage(
            "⚠️ Internal and External marks must be between 0 and 50.",
            "error"
        );

        return;

    }


    const url =
        editingMarkId

            ? `http://localhost:5000/api/marks/${editingMarkId}`

            : "http://localhost:5000/api/marks";


    const method =
        editingMarkId
            ? "PUT"
            : "POST";


    try {

        const response =
            await fetch(
                url,
                {
                    method:
                        method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            studentId:
                                selectedStudentId,

                            subject:
                                subject,

                            internalMarks:
                                internal,

                            externalMarks:
                                external

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save marks"
            );

        }


        showMessage(
            editingMarkId

                ? "✅ Marks updated successfully!"

                : "✅ Marks added successfully!",

            "success"
        );


        editingMarkId = null;


        clearMarksForm();


        await loadExistingMarks();


    } catch (error) {

        console.error(
            "Save marks error:",
            error
        );


        showMessage(
            "❌ " +
            (
                error.message ||
                "Unable to save marks."
            ),

            "error"
        );

    }

}


// ==================================================
// TOTAL PREVIEW
// ==================================================

document
    .getElementById(
        "internalMarks"
    )
    .addEventListener(
        "input",
        updateTotalPreview
    );


document
    .getElementById(
        "externalMarks"
    )
    .addEventListener(
        "input",
        updateTotalPreview
    );


function updateTotalPreview() {

    const internal =
        Number(
            document.getElementById(
                "internalMarks"
            ).value
        ) || 0;


    const external =
        Number(
            document.getElementById(
                "externalMarks"
            ).value
        ) || 0;


    const total =
        internal + external;


    document.getElementById(
        "marksTotalPreview"
    ).textContent =
        `${total} / 100`;

}


// ==================================================
// EDIT MARK
// ==================================================

async function editMark(
    markId
) {

    if (
        !selectedStudentId
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/marks/${selectedStudentId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Failed to load mark"
            );

        }


        const mark =
            (data.marks || [])
                .find(
                    item =>
                        Number(item.id) ===
                        Number(markId)
                );


        if (!mark) {

            return;

        }


        editingMarkId =
            mark.id;


        document.getElementById(
            "marksSubject"
        ).value =
            mark.subject;


        document.getElementById(
            "internalMarks"
        ).value =
            mark.internalMarks;


        document.getElementById(
            "externalMarks"
        ).value =
            mark.externalMarks;


        updateTotalPreview();


        document.getElementById(
            "marksEntrySection"
        ).scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });


        showMessage(
            `✏️ Editing ${mark.subject} marks.`,
            "loading"
        );


    } catch (error) {

        console.error(
            "Edit mark error:",
            error
        );


        showMessage(
            "❌ Unable to load marks for editing.",
            "error"
        );

    }

}


// ==================================================
// DELETE MARK
// ==================================================

async function deleteMark(
    markId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete these marks?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/marks/${markId}`,
                {
                    method:
                        "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete marks"
            );

        }


        showMessage(
            "✅ Marks deleted successfully.",
            "success"
        );


        await loadExistingMarks();


    } catch (error) {

        console.error(
            "Delete marks error:",
            error
        );


        showMessage(
            "❌ " +
            (
                error.message ||
                "Unable to delete marks."
            ),

            "error"
        );

    }

}


// ==================================================
// CLEAR MARKS FORM
// ==================================================

function clearMarksForm() {

    document.getElementById(
        "marksForm"
    ).reset();


    editingMarkId = null;


    updateTotalPreview();

}


// ==================================================
// MESSAGE
// ==================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "marksMessage"
        );


    element.textContent =
        message;


    element.className =
        "marks-message " +
        type;

}


// ==================================================
// CLEAR MESSAGE
// ==================================================

function clearMessage() {

    const element =
        document.getElementById(
            "marksMessage"
        );


    element.textContent = "";


    element.className =
        "marks-message";

}


// ==================================================
// NAVIGATION
// ==================================================

function goToDashboard() {

    window.location.href =
        "teacher-dashboard.html";

}


// ==================================================
// HELPERS
// ==================================================

function getInitials(
    name
) {

    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


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


function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


// ==================================================
// START
// ==================================================

loadStudents();