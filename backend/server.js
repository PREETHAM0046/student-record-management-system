const express = require("express");
const cors = require("cors");
const db = require("./database");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// ==================================================
// TEACHER REGISTER
// ==================================================

app.post(
    "/api/teachers/register",
    (req, res) => {

        const {
            name,
            teacherId,
            password
        } = req.body;


        if (
            !name ||
            !teacherId ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        try {

            const statement =
                db.prepare(`
                    INSERT INTO teachers
                    (
                        name,
                        teacherId,
                        password
                    )
                    VALUES (?, ?, ?)
                `);


            statement.run(
                name,
                teacherId,
                password
            );


            res.status(201).json({

                message:
                    "Teacher account created successfully"

            });


        } catch (error) {

            if (
                error.code ===
                "SQLITE_CONSTRAINT_UNIQUE"
            ) {

                return res.status(400).json({

                    message:
                        "Teacher ID already exists"

                });

            }


            console.error(error);


            res.status(500).json({

                message:
                    "Failed to create teacher account"

            });

        }

    }
);


// ==================================================
// TEACHER LOGIN
// ==================================================

app.post(
    "/api/teachers/login",
    (req, res) => {

        const {
            teacherId,
            password
        } = req.body;


        if (
            !teacherId ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Teacher ID and password are required"

            });

        }


        const teacher =
            db.prepare(`
                SELECT
                    id,
                    name,
                    teacherId
                FROM teachers
                WHERE teacherId = ?
                AND password = ?
            `).get(
                teacherId,
                password
            );


        if (!teacher) {

            return res.status(401).json({

                message:
                    "Invalid Teacher ID or Password"

            });

        }


        res.json({

            message:
                "Login successful",

            teacher:
                teacher

        });

    }
);


// ==================================================
// ADD STUDENT
// ==================================================

app.post(
    "/api/students",
    (req, res) => {

        const {

            teacherId,
            name,
            usn,
            branch,
            semester,
            section,
            email,
            phone

        } = req.body;


        if (

            !teacherId ||
            !name ||
            !usn ||
            !branch ||
            !semester ||
            !section ||
            !email ||
            !phone

        ) {

            return res.status(400).json({

                message:
                    "All student fields are required"

            });

        }


        try {

            const statement =
                db.prepare(`
                    INSERT INTO students
                    (
                        teacherId,
                        name,
                        usn,
                        branch,
                        semester,
                        section,
                        email,
                        phone
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);


            const result =
                statement.run(

                    teacherId,
                    name,
                    usn,
                    branch,
                    String(semester),
                    section,
                    email,
                    phone

                );


            const student =
                db.prepare(`
                    SELECT *
                    FROM students
                    WHERE id = ?
                `).get(
                    result.lastInsertRowid
                );


            res.status(201).json({

                message:
                    "Student added successfully",

                student:
                    student

            });


        } catch (error) {

            if (
                error.code ===
                "SQLITE_CONSTRAINT_UNIQUE"
            ) {

                return res.status(400).json({

                    message:
                        "Student with this USN already exists"

                });

            }


            console.error(error);


            res.status(500).json({

                message:
                    "Failed to add student"

            });

        }

    }
);


// ==================================================
// GET ALL STUDENTS
// ==================================================

app.get(
    "/api/students",
    (req, res) => {

        const students =
            db.prepare(`
                SELECT *
                FROM students
                ORDER BY id DESC
            `).all();


        res.json({

            students:
                students

        });

    }
);


// ==================================================
// UPDATE STUDENT
// ==================================================

app.put(
    "/api/students/:id",
    (req, res) => {

        const studentId =
            Number(req.params.id);


        const {

            name,
            usn,
            branch,
            semester,
            section,
            email,
            phone

        } = req.body;


        if (

            !name ||
            !usn ||
            !branch ||
            !semester ||
            !section ||
            !email ||
            !phone

        ) {

            return res.status(400).json({

                message:
                    "All student fields are required"

            });

        }


        const existingStudent =
            db.prepare(`
                SELECT *
                FROM students
                WHERE id = ?
            `).get(
                studentId
            );


        if (!existingStudent) {

            return res.status(404).json({

                message:
                    "Student not found"

            });

        }


        try {

            db.prepare(`
                UPDATE students

                SET
                    name = ?,
                    usn = ?,
                    branch = ?,
                    semester = ?,
                    section = ?,
                    email = ?,
                    phone = ?

                WHERE id = ?
            `).run(

                name,
                usn,
                branch,
                String(semester),
                section,
                email,
                phone,
                studentId

            );


            const updatedStudent =
                db.prepare(`
                    SELECT *
                    FROM students
                    WHERE id = ?
                `).get(
                    studentId
                );


            res.json({

                message:
                    "Student updated successfully",

                student:
                    updatedStudent

            });


        } catch (error) {

            if (
                error.code ===
                "SQLITE_CONSTRAINT_UNIQUE"
            ) {

                return res.status(400).json({

                    message:
                        "Another student already uses this USN"

                });

            }


            console.error(error);


            res.status(500).json({

                message:
                    "Failed to update student"

            });

        }

    }
);


// ==================================================
// ADD MARKS
// ==================================================

app.post(
    "/api/marks",
    (req, res) => {

        const {

            studentId,
            subject,
            internalMarks,
            externalMarks

        } = req.body;


        if (

            !studentId ||
            !subject ||
            internalMarks === undefined ||
            externalMarks === undefined

        ) {

            return res.status(400).json({

                message:
                    "All marks fields are required"

            });

        }


        const student =
            db.prepare(`
                SELECT *
                FROM students
                WHERE id = ?
            `).get(
                Number(studentId)
            );


        if (!student) {

            return res.status(404).json({

                message:
                    "Student not found"

            });

        }


        const internal =
            Number(internalMarks);

        const external =
            Number(externalMarks);


        if (
            !Number.isFinite(internal) ||
            !Number.isFinite(external) ||
            internal < 0 ||
            internal > 50 ||
            external < 0 ||
            external > 50
        ) {

            return res.status(400).json({

                message:
                    "Internal and external marks must be between 0 and 50"

            });

        }


        const existingMarks =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE studentId = ?
                AND LOWER(subject) = LOWER(?)
            `).get(

                Number(studentId),
                subject.trim()

            );


        if (existingMarks) {

            return res.status(400).json({

                message:
                    "Marks for this subject already exist"

            });

        }


        const total =
            internal + external;


        const result =
            db.prepare(`
                INSERT INTO marks
                (
                    studentId,
                    subject,
                    internalMarks,
                    externalMarks,
                    totalMarks
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(

                Number(studentId),
                subject.trim(),
                internal,
                external,
                total

            );


        const mark =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE id = ?
            `).get(
                result.lastInsertRowid
            );


        res.status(201).json({

            message:
                "Marks added successfully",

            mark:
                mark

        });

    }
);


// ==================================================
// GET MARKS
// ==================================================

app.get(
    "/api/marks/:studentId",
    (req, res) => {

        const studentId =
            Number(req.params.studentId);


        const marks =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE studentId = ?
                ORDER BY id DESC
            `).all(
                studentId
            );


        res.json({

            marks:
                marks

        });

    }
);


// ==================================================
// UPDATE MARKS
// ==================================================

app.put(
    "/api/marks/:id",
    (req, res) => {

        const markId =
            Number(req.params.id);


        const {

            subject,
            internalMarks,
            externalMarks

        } = req.body;


        if (

            !subject ||
            internalMarks === undefined ||
            externalMarks === undefined

        ) {

            return res.status(400).json({

                message:
                    "All marks fields are required"

            });

        }


        const mark =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE id = ?
            `).get(
                markId
            );


        if (!mark) {

            return res.status(404).json({

                message:
                    "Marks record not found"

            });

        }


        const internal =
            Number(internalMarks);

        const external =
            Number(externalMarks);


        if (
            !Number.isFinite(internal) ||
            !Number.isFinite(external) ||
            internal < 0 ||
            internal > 50 ||
            external < 0 ||
            external > 50
        ) {

            return res.status(400).json({

                message:
                    "Internal and external marks must be between 0 and 50"

            });

        }


        db.prepare(`
            UPDATE marks

            SET
                subject = ?,
                internalMarks = ?,
                externalMarks = ?,
                totalMarks = ?

            WHERE id = ?
        `).run(

            subject.trim(),
            internal,
            external,
            internal + external,
            markId

        );


        const updatedMark =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE id = ?
            `).get(
                markId
            );


        res.json({

            message:
                "Marks updated successfully",

            mark:
                updatedMark

        });

    }
);


// ==================================================
// DELETE MARKS
// ==================================================

app.delete(
    "/api/marks/:id",
    (req, res) => {

        const markId =
            Number(req.params.id);


        const mark =
            db.prepare(`
                SELECT *
                FROM marks
                WHERE id = ?
            `).get(
                markId
            );


        if (!mark) {

            return res.status(404).json({

                message:
                    "Marks record not found"

            });

        }


        db.prepare(`
            DELETE FROM marks
            WHERE id = ?
        `).run(
            markId
        );


        res.json({

            message:
                "Marks deleted successfully",

            mark:
                mark

        });

    }
);


// ==================================================
// DELETE STUDENT
// ==================================================

app.delete(
    "/api/students/:id",
    (req, res) => {

        const studentId =
            Number(req.params.id);


        const student =
            db.prepare(`
                SELECT *
                FROM students
                WHERE id = ?
            `).get(
                studentId
            );


        if (!student) {

            return res.status(404).json({

                message:
                    "Student not found"

            });

        }


        db.prepare(`
            DELETE FROM students
            WHERE id = ?
        `).run(
            studentId
        );


        res.json({

            message:
                "Student deleted successfully",

            student:
                student

        });

    }
);


// ==================================================
// ATTENDANCE
// ==================================================


// ==================================================
// GET AVAILABLE SEMESTERS + BRANCHES
// ==================================================

app.get(
    "/api/attendance/classes",
    (req, res) => {

        const semesters =
            db.prepare(`
                SELECT DISTINCT semester
                FROM students
                ORDER BY CAST(semester AS INTEGER)
            `).all();


        const branches =
            db.prepare(`
                SELECT DISTINCT branch
                FROM students
                ORDER BY branch
            `).all();


        res.json({

            semesters:
                semesters.map(
                    item =>
                        item.semester
                ),

            branches:
                branches.map(
                    item =>
                        item.branch
                )

        });

    }
);


// ==================================================
// GET SECTIONS FOR SEMESTER + BRANCH
// ==================================================

app.get(
    "/api/attendance/sections",
    (req, res) => {

        const {
            semester,
            branch
        } = req.query;


        if (
            !semester ||
            !branch
        ) {

            return res.status(400).json({

                message:
                    "Semester and branch are required"

            });

        }


        const sections =
            db.prepare(`
                SELECT DISTINCT section
                FROM students
                WHERE semester = ?
                AND LOWER(branch) = LOWER(?)
                ORDER BY section
            `).all(

                String(semester),
                branch

            );


        res.json({

            sections:
                sections.map(
                    item =>
                        item.section
                )

        });

    }
);


// ==================================================
// SAVE SECTION ATTENDANCE
// ==================================================

app.post(
    "/api/attendance/section",
    (req, res) => {

        const {

            date,
            semester,
            branch,
            section,
            records

        } = req.body;


        if (

            !date ||
            !semester ||
            !branch ||
            !section ||
            !Array.isArray(records)

        ) {

            return res.status(400).json({

                message:
                    "All attendance details are required"

            });

        }


        if (
            records.length === 0
        ) {

            return res.status(400).json({

                message:
                    "No students found"

            });

        }


        for (
            const record of records
        ) {

            const student =
                db.prepare(`
                    SELECT *
                    FROM students
                    WHERE id = ?
                `).get(
                    Number(record.studentId)
                );


            if (!student) {

                return res.status(404).json({

                    message:
                        "Student not found"

                });

            }


            const correctClass =

                String(student.semester) ===
                String(semester)

                &&

                student.branch.toLowerCase() ===
                branch.toLowerCase()

                &&

                student.section.toLowerCase() ===
                section.toLowerCase();


            if (!correctClass) {

                return res.status(400).json({

                    message:
                        "Student does not belong to selected class"

                });

            }


            if (

                record.status !== "Present"

                &&

                record.status !== "Absent"

            ) {

                return res.status(400).json({

                    message:
                        "Invalid attendance status"

                });

            }

        }


        const saveAttendance =
            db.transaction(
                (records) => {

                    for (
                        const record of records
                    ) {

                        db.prepare(`
                            INSERT INTO attendance
                            (
                                studentId,
                                date,
                                status
                            )
                            VALUES (?, ?, ?)

                            ON CONFLICT(studentId, date)
                            DO UPDATE SET
                                status = excluded.status
                        `).run(

                            Number(record.studentId),
                            date,
                            record.status

                        );

                    }

                }
            );


        saveAttendance(records);


        res.status(201).json({

            message:
                "Section attendance saved successfully",

            count:
                records.length

        });

    }
);


// ==================================================
// GET SECTION ATTENDANCE
// ==================================================

app.get(
    "/api/attendance/section",
    (req, res) => {

        const {

            date,
            semester,
            branch,
            section

        } = req.query;


        if (

            !date ||
            !semester ||
            !branch ||
            !section

        ) {

            return res.status(400).json({

                message:
                    "Date, semester, branch and section are required"

            });

        }


        const students =
            db.prepare(`
                SELECT
                    id,
                    name,
                    usn

                FROM students

                WHERE semester = ?

                AND LOWER(branch) = LOWER(?)

                AND LOWER(section) = LOWER(?)

                ORDER BY name
            `).all(

                String(semester),
                branch,
                section

            );


        const result =
            students.map(
                student => {

                    const record =
                        db.prepare(`
                            SELECT status
                            FROM attendance
                            WHERE studentId = ?
                            AND date = ?
                        `).get(

                            student.id,
                            date

                        );


                    return {

                        studentId:
                            student.id,

                        name:
                            student.name,

                        usn:
                            student.usn,

                        status:
                            record
                                ? record.status
                                : null

                    };

                }
            );


        res.json({

            date:
                date,

            semester:
                semester,

            branch:
                branch,

            section:
                section,

            students:
                result

        });

    }
);


// ==================================================
// GET STUDENT ATTENDANCE SUMMARY
// ==================================================

app.get(
    "/api/attendance/student/:studentId",
    (req, res) => {

        const studentId =
            Number(req.params.studentId);


        const studentAttendance =
            db.prepare(`
                SELECT *
                FROM attendance
                WHERE studentId = ?
                ORDER BY date DESC
            `).all(
                studentId
            );


        const totalDays =
            studentAttendance.length;


        const presentDays =
            studentAttendance.filter(
                record =>
                    record.status ===
                    "Present"
            ).length;


        const absentDays =
            studentAttendance.filter(
                record =>
                    record.status ===
                    "Absent"
            ).length;


        const percentage =
            totalDays === 0

                ? 0

                :

                Number(

                    (
                        presentDays /
                        totalDays *
                        100
                    ).toFixed(2)

                );


        res.json({

            attendance:
                studentAttendance,

            summary: {

                totalDays:
                    totalDays,

                presentDays:
                    presentDays,

                absentDays:
                    absentDays,

                percentage:
                    percentage

            }

        });

    }
);


// ==================================================
// STUDENT LOGIN
// ==================================================

app.post(
    "/api/students/login",
    (req, res) => {

        const {
            usn,
            name
        } = req.body;


        if (
            !usn ||
            !name
        ) {

            return res.status(400).json({

                message:
                    "USN and student name are required"

            });

        }


        const student =
            db.prepare(`
                SELECT
                    id,
                    name,
                    usn,
                    branch,
                    semester,
                    section,
                    email,
                    phone
                FROM students
                WHERE LOWER(usn) = LOWER(?)
                AND LOWER(name) = LOWER(?)
            `).get(

                usn.trim(),
                name.trim()

            );


        if (!student) {

            return res.status(401).json({

                message:
                    "Invalid USN or Student Name"

            });

        }


        res.json({

            message:
                "Student login successful",

            student:
                student

        });

    }
);


// ==================================================
// START SERVER
// ==================================================
// =====================================
// ANNOUNCEMENTS
// =====================================

// CREATE ANNOUNCEMENT
app.post("/api/announcements", (req, res) => {

    const {
        teacherId,
        title,
        message
    } = req.body;

    if (!teacherId || !title || !message) {
        return res.status(400).json({
            message: "All announcement fields are required"
        });
    }

    try {

        const createdAt =
            new Date().toISOString();

        const result = db.prepare(`
            INSERT INTO announcements
            (teacherId, title, message, createdAt)
            VALUES (?, ?, ?, ?)
        `).run(
            teacherId,
            title.trim(),
            message.trim(),
            createdAt
        );

        res.status(201).json({
            message: "Announcement created successfully",
            announcementId: result.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create announcement"
        });
    }
});


// GET ALL ANNOUNCEMENTS
app.get("/api/announcements", (req, res) => {

    try {

        const announcements = db.prepare(`
            SELECT
                id,
                teacherId,
                title,
                message,
                createdAt
            FROM announcements
            ORDER BY id DESC
        `).all();

        res.json(announcements);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load announcements"
        });
    }
});


// DELETE ANNOUNCEMENT
app.delete("/api/announcements/:id", (req, res) => {

    const { id } = req.params;

    try {

        const announcement =
            db.prepare(`
                SELECT *
                FROM announcements
                WHERE id = ?
            `).get(id);

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        db.prepare(`
            DELETE FROM announcements
            WHERE id = ?
        `).run(id);

        res.json({
            message: "Announcement deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete announcement"
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});