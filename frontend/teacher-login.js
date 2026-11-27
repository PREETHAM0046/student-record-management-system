document.getElementById("teacherLoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const teacherId = document.getElementById("teacherUserId").value;
    const password = document.getElementById("teacherPassword").value;

    try {
        const response = await fetch("http://localhost:5000/api/teachers/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                teacherId: teacherId,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("teacher", JSON.stringify(data.teacher));

            alert("Login successful!");

            window.location.href = "teacher-dashboard.html";

        } else {
            alert(data.message);c
        }

    } catch (error) {
        alert("Cannot connect to server!");
        console.error(error);
    }
});