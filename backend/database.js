const Database = require("better-sqlite3");

const db = new Database("database.db");


// ===============================
// ENABLE FOREIGN KEYS
// ===============================

db.pragma("foreign_keys = ON");


// ===============================
// TEACHERS TABLE
// ===============================

db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        teacherId TEXT NOT NULL UNIQUE,

        password TEXT NOT NULL

    )
`);


// ===============================
// STUDENTS TABLE
// ===============================

db.exec(`
    CREATE TABLE IF NOT EXISTS students (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        teacherId TEXT NOT NULL,

        name TEXT NOT NULL,

        usn TEXT NOT NULL UNIQUE,

        branch TEXT NOT NULL,

        semester TEXT NOT NULL,

        section TEXT NOT NULL,

        email TEXT NOT NULL,

        phone TEXT NOT NULL

    )
`);


// ===============================
// MARKS TABLE
// ===============================

db.exec(`
    CREATE TABLE IF NOT EXISTS marks (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        studentId INTEGER NOT NULL,

        subject TEXT NOT NULL,

        internalMarks INTEGER NOT NULL,

        externalMarks INTEGER NOT NULL,

        totalMarks INTEGER NOT NULL,

        FOREIGN KEY (studentId)
            REFERENCES students(id)
            ON DELETE CASCADE

    )
`);


// ===============================
// ATTENDANCE TABLE
// ===============================

db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        studentId INTEGER NOT NULL,

        date TEXT NOT NULL,

        status TEXT NOT NULL,

        FOREIGN KEY (studentId)
            REFERENCES students(id)
            ON DELETE CASCADE,

        UNIQUE(studentId, date)

    )
`);


// ===============================
// DATABASE READY
// ===============================
db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherId TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL
    )
`);
console.log(
    "✅ SQLite database connected successfully"
);

console.log(
    "📁 Database file: database.db"
);


module.exports = db;