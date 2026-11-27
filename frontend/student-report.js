const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "student-login.html";
}

let marks = [];
let attendance = [];

document.addEventListener("DOMContentLoaded", () => {
    loadReport();
});


// ===============================
// LOAD COMPLETE REPORT
// ===============================

async function loadReport() {

    try {

        displayStudentProfile();

        await loadMarks();

        await loadAttendance();

    } catch (error) {

        console.error("Report loading error:", error);

        document.getElementById("reportMarksBody").innerHTML = `
            <tr>
                <td colspan="7" class="report-empty">
                    Unable to load marks records.
                </td>
            </tr>
        `;

        document.getElementById("reportAttendanceBody").innerHTML = `
            <tr>
                <td colspan="3" class="report-empty">
                    Unable to load attendance records.
                </td>
            </tr>
        `;
    }
}


// ===============================
// STUDENT PROFILE
// ===============================

function displayStudentProfile() {

    document.getElementById("reportStudentName").textContent =
        student.name || "-";

    document.getElementById("reportUSN").textContent =
        student.usn || "-";

    document.getElementById("reportBranch").textContent =
        student.branch || "-";

    document.getElementById("reportSemester").textContent =
        formatSemester(student.semester);

    document.getElementById("reportSection").textContent =
        student.section || "-";

    document.getElementById("reportEmail").textContent =
        student.email || "-";

    document.getElementById("reportPhone").textContent =
        student.phone || "-";

    document.getElementById("reportAvatar").textContent =
        getInitials(student.name);
}


// ===============================
// MARKS
// ===============================

async function loadMarks() {

    const response = await fetch(
        `http://localhost:5000/api/marks/${student.id}`
    );

    if (!response.ok) {
        throw new Error("Failed to load marks");
    }

    const data = await response.json();

    // Backend returns { marks: [...] }
    marks = data.marks || [];

    calculateAcademicSummary();

    displayMarks();
}


// ===============================
// ACADEMIC SUMMARY
// ===============================

function calculateAcademicSummary() {

    const subjectCount = marks.length;

    let obtained = 0;
    let maximum = 0;

    marks.forEach(mark => {

        obtained += Number(mark.totalMarks) || 0;

        maximum += 100;
    });

    const percentage =
        maximum > 0
            ? (obtained / maximum) * 100
            : 0;

    document.getElementById("reportSubjects").textContent =
        subjectCount;

    document.getElementById("reportTotalMarks").textContent =
        `${obtained} / ${maximum}`;

    document.getElementById("reportPercentage").textContent =
        `${percentage.toFixed(2)}%`;

    document.getElementById("reportGrade").textContent =
        calculateGrade(percentage);
}


// ===============================
// DISPLAY MARKS
// ===============================

function displayMarks() {

    const tbody =
        document.getElementById("reportMarksBody");

    tbody.innerHTML = "";

    if (marks.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="report-empty">
                    No marks records available.
                </td>
            </tr>
        `;

        return;
    }

    marks.forEach((mark, index) => {

        const total =
            Number(mark.totalMarks) || 0;

        const grade =
            calculateGrade(total);

        const result =
            total >= 35
                ? "PASS"
                : "FAIL";

        const resultClass =
            total >= 35
                ? "report-pass"
                : "report-fail";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td class="report-subject">
                ${escapeHTML(mark.subject)}
            </td>

            <td>
                ${mark.internalMarks}
            </td>

            <td>
                ${mark.externalMarks}
            </td>

            <td>
                <strong>${total}</strong> / 100
            </td>

            <td>
                <span class="report-grade">
                    ${grade}
                </span>
            </td>

            <td>
                <span class="${resultClass}">
                    ${result}
                </span>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// ===============================
// ATTENDANCE
// ===============================

async function loadAttendance() {

    const response = await fetch(
        `http://localhost:5000/api/attendance/student/${student.id}`
    );

    if (!response.ok) {
        throw new Error("Failed to load attendance");
    }

    const data = await response.json();

    // Backend returns { attendance: [...] }
    attendance = data.attendance || [];

    calculateAttendanceSummary();

    displayAttendance();
}


// ===============================
// ATTENDANCE SUMMARY
// ===============================

function calculateAttendanceSummary() {

    const total =
        attendance.length;

    const present =
        attendance.filter(
            record =>
                record.status === "Present"
        ).length;

    const absent =
        attendance.filter(
            record =>
                record.status === "Absent"
        ).length;

    const percentage =
        total > 0
            ? (present / total) * 100
            : 0;

    document.getElementById("reportTotalClasses").textContent =
        total;

    document.getElementById("reportPresent").textContent =
        present;

    document.getElementById("reportAbsent").textContent =
        absent;

    document.getElementById("reportAttendancePercentage").textContent =
        `${percentage.toFixed(2)}%`;
}


// ===============================
// DISPLAY ATTENDANCE
// ===============================

function displayAttendance() {

    const tbody =
        document.getElementById("reportAttendanceBody");

    tbody.innerHTML = "";

    if (attendance.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="report-empty">
                    No attendance records available.
                </td>
            </tr>
        `;

        return;
    }

    const sortedAttendance =
        [...attendance].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    sortedAttendance.forEach(
        (record, index) => {

            const isPresent =
                record.status === "Present";

            const statusClass =
                isPresent
                    ? "report-attendance-present"
                    : "report-attendance-absent";

            const icon =
                isPresent
                    ? "✅"
                    : "❌";

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatDate(record.date)}
                </td>

                <td>
                    <span class="${statusClass}">
                        ${icon}
                        ${escapeHTML(record.status)}
                    </span>
                </td>
            `;

            tbody.appendChild(row);
        }
    );
}


// ===============================
// GRADE
// ===============================

function calculateGrade(percentage) {

    if (percentage >= 90)
        return "A+";

    if (percentage >= 80)
        return "A";

    if (percentage >= 70)
        return "B+";

    if (percentage >= 60)
        return "B";

    if (percentage >= 50)
        return "C";

    if (percentage >= 40)
        return "D";

    return "F";
}


// ===============================
// FORMAT SEMESTER
// ===============================

function formatSemester(semester) {

    if (!semester)
        return "-";

    const value =
        String(semester);

    const number =
        parseInt(value);

    if (isNaN(number))
        return value;

    const suffix =
        number === 1 ? "st" :
        number === 2 ? "nd" :
        number === 3 ? "rd" :
        "th";

    return `${number}${suffix} Semester`;
}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    if (!dateString)
        return "-";

    const date =
        new Date(dateString);

    if (isNaN(date.getTime()))
        return dateString;

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ===============================
// INITIALS
// ===============================

function getInitials(name) {

    if (!name)
        return "ST";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// NAVIGATION
// ===============================

function goToDashboard() {

    window.location.href =
        "student-dashboard.html";
}