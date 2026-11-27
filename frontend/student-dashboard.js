const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "student-login.html";
} else {
    loadStudentDashboard();
}


// =====================================
// LOAD STUDENT DASHBOARD
// =====================================

async function loadStudentDashboard() {

    displayStudentProfile();

    await loadStudentAnnouncements();

    await loadStudentMarks();

    await loadStudentAttendance();
}


// =====================================
// STUDENT PROFILE
// =====================================

function displayStudentProfile() {

    document.getElementById("studentName").textContent =
        student.name;

    document.getElementById("profileName").textContent =
        student.name;

    document.getElementById("profileUsn").textContent =
        student.usn;

    document.getElementById("profileBranch").textContent =
        student.branch;

    document.getElementById("profileSemester").textContent =
        `${student.semester}${getSemesterSuffix(student.semester)} Semester`;

    document.getElementById("profileSection").textContent =
        `Section ${student.section}`;

    document.getElementById("profileEmail").textContent =
        student.email || "-";

    document.getElementById("profilePhone").textContent =
        student.phone || "-";


    // Avatar initials
    document.getElementById("studentAvatar").textContent =
        getInitials(student.name);
}


// =====================================
// LOAD ANNOUNCEMENTS
// =====================================

async function loadStudentAnnouncements() {

    const container =
        document.getElementById(
            "studentAnnouncementsContainer"
        );


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/announcements"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load announcements"
            );
        }


        displayStudentAnnouncements(data);


    } catch (error) {

        console.error(
            "Announcements loading error:",
            error
        );


        container.innerHTML = `

            <div class="student-announcement-empty">

                <div class="student-announcement-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Load Announcements
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>

            </div>

        `;
    }
}


// =====================================
// DISPLAY ANNOUNCEMENTS
// =====================================

function displayStudentAnnouncements(
    announcements
) {

    const container =
        document.getElementById(
            "studentAnnouncementsContainer"
        );


    container.innerHTML = "";


    if (
        !announcements ||
        announcements.length === 0
    ) {

        container.innerHTML = `

            <div class="student-announcement-empty">

                <div class="student-announcement-empty-icon">
                    📭
                </div>

                <h3>
                    No Announcements
                </h3>

                <p>
                    There are no announcements from your teacher yet.
                </p>

            </div>

        `;

        return;
    }


    announcements.forEach(
        (announcement, index) => {

            const card =
                document.createElement("div");


            card.className =
                "student-announcement-card";


            if (index === 0) {
                card.classList.add(
                    "student-latest-announcement"
                );
            }


            card.innerHTML = `

                <div class="student-announcement-top">

                    <div class="student-announcement-icon">
                        📢
                    </div>


                    <div class="student-announcement-heading">

                        <div class="student-announcement-title-line">

                            <h3>
                                ${escapeHTML(
                                    announcement.title
                                )}
                            </h3>

                            ${
                                index === 0
                                    ? `
                                        <span class="student-latest-badge">
                                            LATEST
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        <span class="student-announcement-date">
                            🕒
                            ${formatAnnouncementDate(
                                announcement.createdAt
                            )}
                        </span>

                    </div>

                </div>


                <div class="student-announcement-message">

                    ${escapeHTML(
                        announcement.message
                    ).replace(/\n/g, "<br>")}

                </div>

            `;


            container.appendChild(card);

        }
    );
}


// =====================================
// LOAD MARKS
// =====================================

async function loadStudentMarks() {

    const container =
        document.getElementById("studentMarksContainer");

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/marks/${student.id}`
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


        // Empty state
        if (marks.length === 0) {

            document.getElementById("academicSubjects")
                .textContent = "0";

            document.getElementById("academicTotalMarks")
                .textContent = "0";

            document.getElementById("academicPercentage")
                .textContent = "0%";

            document.getElementById("academicGrade")
                .textContent = "-";


            container.innerHTML = `
                <div class="student-empty-state">

                    <div>📚</div>

                    <h3>
                        No Marks Available
                    </h3>

                    <p>
                        Your teacher has not added marks yet.
                    </p>

                </div>
            `;

            return;
        }


        // =================================
        // CALCULATE ACADEMIC SUMMARY
        // =================================

        let obtainedMarks = 0;

        let maximumMarks =
            marks.length * 100;


        marks.forEach(mark => {

            obtainedMarks +=
                Number(mark.totalMarks) || 0;

        });


        const percentage =
            maximumMarks > 0
                ? (obtainedMarks / maximumMarks) * 100
                : 0;


        const grade =
            calculateGrade(percentage);


        // Display summary
        document.getElementById("academicSubjects")
            .textContent = marks.length;

        document.getElementById("academicTotalMarks")
            .textContent =
                `${obtainedMarks} / ${maximumMarks}`;

        document.getElementById("academicPercentage")
            .textContent =
                `${percentage.toFixed(1)}%`;

        document.getElementById("academicGrade")
            .textContent = grade;


        // =================================
        // DISPLAY SUBJECT MARKS
        // =================================

        container.innerHTML = "";


        marks.forEach((mark, index) => {

            const total =
                Number(mark.totalMarks) || 0;

            const internal =
                Number(mark.internalMarks) || 0;

            const external =
                Number(mark.externalMarks) || 0;


            const subjectPercentage =
                total;


            const subjectGrade =
                calculateGrade(subjectPercentage);


            const pass =
                total >= 35;


            const card =
                document.createElement("div");


            card.className =
                "student-mark-row";


            card.innerHTML = `

                <div class="student-mark-number">
                    ${index + 1}
                </div>


                <div class="student-mark-subject">

                    <strong>
                        ${escapeHTML(mark.subject)}
                    </strong>

                    <span>
                        Subject
                    </span>

                </div>


                <div class="student-mark-score">

                    <strong>
                        ${total}
                    </strong>

                    <span>
                        / 100
                    </span>

                </div>


                <div class="student-mark-breakdown">

                    <span>
                        Internal:
                        <strong>
                            ${internal}
                        </strong>
                    </span>

                    <span>
                        External:
                        <strong>
                            ${external}
                        </strong>
                    </span>

                </div>


                <div class="student-mark-grade">

                    <strong>
                        ${subjectGrade}
                    </strong>

                    <span class="${pass ? "mark-pass" : "mark-fail"}">
                        ${pass ? "PASS" : "FAIL"}
                    </span>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Marks loading error:",
            error
        );


        container.innerHTML = `

            <div class="student-empty-state">

                <div>⚠️</div>

                <h3>
                    Unable to Load Marks
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>

            </div>

        `;

    }
}


// =====================================
// GRADE CALCULATION
// =====================================

function calculateGrade(percentage) {

    if (percentage >= 90) {
        return "A+";
    }

    if (percentage >= 80) {
        return "A";
    }

    if (percentage >= 70) {
        return "B+";
    }

    if (percentage >= 60) {
        return "B";
    }

    if (percentage >= 50) {
        return "C";
    }

    if (percentage >= 40) {
        return "D";
    }

    return "F";
}


// =====================================
// LOAD ATTENDANCE
// =====================================

async function loadStudentAttendance() {

    const container =
        document.getElementById(
            "studentAttendanceContainer"
        );

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/attendance/student/${student.id}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load attendance"
            );
        }


        const attendance =
            data.attendance || [];


        // =================================
        // SUMMARY
        // =================================

        const total =
            attendance.length;

        const present =
            attendance.filter(
                item =>
                    String(item.status).toLowerCase()
                    === "present"
            ).length;

        const absent =
            total - present;


        const percentage =
            total > 0
                ? (present / total) * 100
                : 0;


        document.getElementById("attendanceTotal")
            .textContent = total;

        document.getElementById("attendancePresent")
            .textContent = present;

        document.getElementById("attendanceAbsent")
            .textContent = absent;

        document.getElementById("attendancePercentage")
            .textContent =
                `${percentage.toFixed(1)}%`;


        // =================================
        // EMPTY ATTENDANCE
        // =================================

        if (attendance.length === 0) {

            container.innerHTML = `

                <div class="student-empty-state">

                    <div>📅</div>

                    <h3>
                        No Attendance Records
                    </h3>

                    <p>
                        Your teacher has not marked attendance yet.
                    </p>

                </div>

            `;

            return;
        }


        // =================================
        // DISPLAY HISTORY
        // =================================

        container.innerHTML = "";


        const sortedAttendance =
            [...attendance].sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


        sortedAttendance.forEach(
            (record, index) => {

                const isPresent =
                    String(record.status)
                        .toLowerCase()
                        === "present";


                const row =
                    document.createElement("div");


                row.className =
                    "student-attendance-row";


                row.innerHTML = `

                    <div class="attendance-date-number">
                        ${index + 1}
                    </div>


                    <div class="attendance-date">
                        📅
                        <strong>
                            ${formatDate(record.date)}
                        </strong>
                    </div>


                    <div class="attendance-status
                        ${isPresent
                            ? "attendance-present"
                            : "attendance-absent"}">

                        ${isPresent
                            ? "✓ Present"
                            : "✕ Absent"}

                    </div>

                `;


                container.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        container.innerHTML = `

            <div class="student-empty-state">

                <div>⚠️</div>

                <h3>
                    Unable to Load Attendance
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>

            </div>

        `;

    }
}


// =====================================
// FORMAT ATTENDANCE DATE
// =====================================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================
// FORMAT ANNOUNCEMENT DATE
// =====================================

function formatAnnouncementDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =====================================
// HELPERS
// =====================================

function getInitials(name) {

    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word =>
            word.charAt(0).toUpperCase()
        )
        .join("");
}


function getSemesterSuffix(semester) {

    const number =
        Number(semester);

    if (number === 1) return "st";
    if (number === 2) return "nd";
    if (number === 3) return "rd";

    return "th";
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


// =====================================
// OPEN STUDENT REPORT
// =====================================

function openStudentReport() {

    window.location.href =
        "student-report.html";
}


// =====================================
// LOGOUT
// =====================================

function studentLogout() {

    localStorage.removeItem("student");

    window.location.href =
        "student-login.html";
}