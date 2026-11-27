function studentLogin() {
    window.location.href = "student-login.html";
}

function teacherLogin() {
    window.location.href = "teacher-login.html";
}

function goHome() {
    window.location.href = "index.html";
}


// Teacher Login
const teacherLoginForm = document.getElementById("teacherLoginForm");

if (teacherLoginForm) {

    teacherLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const userId = document.getElementById("teacherUserId").value;
        const password = document.getElementById("teacherPassword").value;

        try {

            const response = await fetch("/api/teacher/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Teacher login successful!");
            } else {
                alert(data.message);
            }

        } catch (error) {

            alert("Cannot connect to the server. Make sure the backend is running.");

        }

    });

}

function goTeacherRegister() {
    window.location.href = "teacher-register.html";
}