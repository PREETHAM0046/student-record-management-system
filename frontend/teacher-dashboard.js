const teacher = JSON.parse(localStorage.getItem("teacher"));

if (!teacher) {
    window.location.href = "teacher-login.html";
} else {
    document.getElementById("teacherName").textContent = teacher.name;
}


// ================================
// LOAD DASHBOARD STATISTICS
// ================================

async function loadDashboardStats() {

    try {

        // Get all students
        const studentsResponse =
            await fetch("/api/students");

        const studentsData =
            await studentsResponse.json();

        if (!studentsResponse.ok) {
            throw new Error(
                studentsData.message ||
                "Failed to load students"
            );
        }

        const students =
            studentsData.students || [];


        // -------------------------------
        // STUDENT STATISTICS
        // -------------------------------

        const branches =
            new Set(
                students.map(student =>
                    String(student.branch).trim().toLowerCase()
                )
            );

        const semesters =
            new Set(
                students.map(student =>
                    String(student.semester).trim()
                )
            );

        const sections =
            new Set(
                students.map(student =>
                    String(student.section).trim().toLowerCase()
                )
            );


        document.getElementById("totalStudents")
            .textContent = students.length;

        document.getElementById("totalBranches")
            .textContent = branches.size;

        document.getElementById("totalSemesters")
            .textContent = semesters.size;

        document.getElementById("totalSections")
            .textContent = sections.size;


        // -------------------------------
        // MARKS RECORDS
        // -------------------------------

        let totalMarks = 0;

        for (const student of students) {

            try {

                const response =
                    await fetch(
                        `/api/marks/${student.id}`
                    );

                if (!response.ok) {
                    continue;
                }

                const data =
                    await response.json();

                totalMarks +=
                    (data.marks || []).length;

            } catch (error) {

                console.log(
                    "Could not load marks for student:",
                    student.id
                );

            }

        }


        document.getElementById("totalMarks")
            .textContent = totalMarks;


        // -------------------------------
        // ATTENDANCE RECORDS
        // -------------------------------

        let totalAttendance = 0;

        for (const student of students) {

            try {

                const response =
                    await fetch(
                        `/api/attendance/student/${student.id}`
                    );

                if (!response.ok) {
                    continue;
                }

                const data =
                    await response.json();

                totalAttendance +=
                    (data.attendance || []).length;

            } catch (error) {

                console.log(
                    "Could not load attendance for student:",
                    student.id
                );

            }

        }


        document.getElementById("totalAttendance")
            .textContent = totalAttendance;


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

        document.getElementById("totalStudents")
            .textContent = "—";

        document.getElementById("totalBranches")
            .textContent = "—";

        document.getElementById("totalSemesters")
            .textContent = "—";

        document.getElementById("totalSections")
            .textContent = "—";

        document.getElementById("totalMarks")
            .textContent = "—";

        document.getElementById("totalAttendance")
            .textContent = "—";
    }
}


// ================================
// LOGOUT
// ================================

function teacherLogout() {

    localStorage.removeItem("teacher");

    window.location.href =
        "teacher-login.html";
}


// ================================
// NAVIGATION
// ================================

function openAddStudent() {

    window.location.href =
        "add-student.html";
}


function openStudents() {

    window.location.href =
        "students.html";
}


function openMarks() {

    window.location.href =
        "marks.html";
}


function openAttendance() {

    window.location.href =
        "attendance.html";
}


function openUpdateStudent() {

    window.location.href =
        "update-student.html";
}


function openDeleteStudent() {

    window.location.href =
        "delete-student.html";
}


// ================================
// ANNOUNCEMENTS
// ================================

function openAnnouncements() {

    window.location.href =
        "announcements.html";
}


// ================================
// START DASHBOARD
// ================================

loadDashboardStats();