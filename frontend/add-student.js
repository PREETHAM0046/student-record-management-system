const teacher = JSON.parse(localStorage.getItem("teacher"));


// Check if teacher is logged in
if (!teacher) {

    window.location.href = "teacher-login.html";

}


// Add Student Form
const form = document.getElementById("addStudentForm");


form.addEventListener("submit", async function(event) {

    event.preventDefault();


    const name = document.getElementById("studentName").value.trim();

    const usn = document.getElementById("studentUSN").value.trim();

    const branch = document.getElementById("studentBranch").value.trim();

    const semester = document.getElementById("studentSemester").value;

    const section = document.getElementById("studentSection").value.trim();

    const email = document.getElementById("studentEmail").value.trim();

    const phone = document.getElementById("studentPhone").value.trim();


    try {

        const response = await fetch("http://localhost:5000/api/students", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                teacherId: teacher.teacherId,

                name: name,

                usn: usn,

                branch: branch,

                semester: semester,

                section: section,

                email: email,

                phone: phone

            })

        });


        const data = await response.json();


        if (response.ok) {

            alert("Student added successfully!");

            form.reset();

        } else {

            alert(data.message || "Failed to add student.");

        }


    } catch (error) {

        console.error("Error:", error);

        alert("Cannot connect to server!");

    }

});


// Back button
function goBack() {

    window.location.href = "teacher-dashboard.html";

}